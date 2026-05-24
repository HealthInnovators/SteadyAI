import type { FastifyInstance } from 'fastify';
import { AgentEventType, MealType, NutritionInputType } from '@prisma/client';

import { steadyAiInternalRuntime } from '../agents/runtime/steadyai-internal.runtime';
import type { AgentCapabilityId } from '../agents/runtime/types';
import { getPrismaClient } from '../db/prisma';
import { optionalAuthenticateRequest } from '../middleware/auth';
import type { AgentChatType } from '../services/agent-chat.service';
import { generateAgentChatReply } from '../services/agent-chat.service';
import { generateEducatorLesson } from '../services/educator.service';
import { attachExerciseMedia } from '../services/exercise-media.service';
import { ingestNutrition } from '../services/nutrition.service';
import {
  getLatestWorkoutSessionInsight,
  getWorkoutHistorySummary,
  getWorkoutPreferences
} from '../services/workout-session.service';

interface AssistantMessageBody {
  message: string;
}

type AssistantRoute =
  | { type: 'AGENT'; agentType: AgentChatType; toolName: 'steadyai.ask_agent' }
  | { type: 'WORKOUT'; toolName: 'steadyai.workout_coach' }
  | { type: 'EDUCATOR'; toolName: 'steadyai.educator_help' };

type AssistantIntent =
  | 'FITNESS'
  | 'NUTRITION'
  | 'TRACKING'
  | 'CHECK_IN'
  | 'COMMUNITY'
  | 'REPORTS'
  | 'STORE'
  | 'EDUCATION'
  | 'GENERAL';

interface AssistantCard {
  id: string;
  type: 'summary' | 'reasoning' | 'next_steps';
  title: string;
  body?: string;
  items?: string[];
  actions?: Array<{ label: string; prompt: string }>;
}

interface AssistantWorkoutExercise {
  name: string;
  durationMin: number;
  reps: string;
  thumbnailLabel?: string;
  mediaUrl?: string;
  mediaType?: 'GIF' | 'MP4' | 'IMAGE' | 'NONE';
  gifUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
  note: string;
}

interface AssistantWorkoutPlan {
  planId: string;
  title: string;
  focus: string;
  estimatedTotalMin: number;
  exercises: AssistantWorkoutExercise[];
}

interface AssistantMealOption {
  name: string;
  imageUrl: string;
  calories: number;
  proteinG: number;
  prepTimeMin: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
  note: string;
}

interface AssistantMealPlan {
  planId: string;
  title: string;
  goal: string;
  options: AssistantMealOption[];
}

interface AssistantNutritionLog {
  entryId: string;
  mealText: string;
  consumedAt: string;
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  todaySummary: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    entries: number;
  };
}

function pickAssistantRoute(message: string): AssistantRoute {
  const normalized = message.toLowerCase();

  if (/\b(myth|misinformation|evidence|study|citation|true or false)\b/.test(normalized)) {
    return { type: 'EDUCATOR', toolName: 'steadyai.educator_help' };
  }

  if (/\b(workout|fitness|exercise|training|strength|cardio)\b/.test(normalized)) {
    return { type: 'WORKOUT', toolName: 'steadyai.workout_coach' };
  }

  if (/\b(meal|nutrition|grocery|protein|calorie|diet|lunch|dinner|breakfast|snack|chicken)\b/.test(normalized)) {
    return { type: 'AGENT', agentType: 'MEAL_PLANNER', toolName: 'steadyai.ask_agent' };
  }

  if (/\b(community|post|reply|engage|peer)\b/.test(normalized)) {
    return { type: 'AGENT', agentType: 'COMMUNITY_GUIDE', toolName: 'steadyai.ask_agent' };
  }

  return { type: 'AGENT', agentType: 'HABIT_COACH', toolName: 'steadyai.ask_agent' };
}

function isNutritionLogRequest(message: string): boolean {
  return /\b(log|logged|track|record|save|ate|had)\b.*\b(meal|lunch|dinner|breakfast|snack|food|intake)\b/i.test(message)
    || /\b(log|track|record|save)\b/i.test(message);
}

function extractMealText(message: string): string {
  return message
    .replace(/^\s*(please\s+)?(log|track|record|save)\s+(to\s+)?(my\s+)?(meal|lunch|dinner|breakfast|snack|food|intake)?\s*:?\s*/i, '')
    .trim();
}

function detectAssistantIntent(message: string): AssistantIntent {
  const normalized = message.toLowerCase();

  if (/\b(myth|misinformation|evidence|study|citation|true or false)\b/.test(normalized)) {
    return 'EDUCATION';
  }
  if (/\b(workout|fitness|exercise|training|routine|strength|cardio)\b/.test(normalized)) {
    return 'FITNESS';
  }
  if (/\b(meal|nutrition|grocery|protein|calorie|diet|macro|lunch|dinner|breakfast|snack|chicken)\b/.test(normalized)) {
    return 'NUTRITION';
  }
  if (/\b(track|tracking|sync|steps|sleep|heart rate|phone data|health connect|wearable|device data)\b/.test(normalized)) {
    return 'TRACKING';
  }
  if (/\b(check-?in|streak|habit|consistency|missed)\b/.test(normalized)) {
    return 'CHECK_IN';
  }
  if (/\b(community|post|reply|engage|peer)\b/.test(normalized)) {
    return 'COMMUNITY';
  }
  if (/\b(report|trend|summary|analytics|insight)\b/.test(normalized)) {
    return 'REPORTS';
  }
  if (/\b(store|product|buy|purchase|coach feedback)\b/.test(normalized)) {
    return 'STORE';
  }

  return 'GENERAL';
}

function buildCards(input: {
  reply: string;
  reasoning: Array<{ title: string; detail: string }>;
  route: AssistantRoute;
  intent: AssistantIntent;
}): AssistantCard[] {
  const cards: AssistantCard[] = [
    {
      id: 'summary',
      type: 'summary',
      title: 'Assistant Summary',
      body: input.reply
    }
  ];

  if (input.reasoning.length > 0) {
    cards.push({
      id: 'reasoning',
      type: 'reasoning',
      title: 'Why This Response',
      items: input.reasoning.slice(0, 4).map((step) => `${step.title}: ${step.detail}`)
    });
  }

  const nextSteps =
    input.intent === 'TRACKING'
      ? ['Review data permissions.', 'Sync today\'s steps and activity.', 'Use reports to spot patterns before changing the plan.']
      : input.route.type === 'WORKOUT'
      ? ['Try the workout today.', 'Ask for an easier version if needed.', 'Log how it felt when finished.']
      : input.route.type === 'EDUCATOR'
      ? ['Ask for one practical example.', 'Ask for one citation-backed clarification.', 'Ask for a myth-safe rephrase.']
      : input.route.agentType === 'MEAL_PLANNER'
        ? ['Ask for a 3-day plan.', 'Ask for a grocery list.', 'Ask for low-prep alternatives.']
        : input.route.agentType === 'COMMUNITY_GUIDE'
          ? ['Ask for one post draft.', 'Ask for one supportive reply.', 'Ask for one peer outreach message.']
          : ['Ask for a 7-day reset plan.', 'Ask for one tiny daily habit.', 'Ask for a fallback plan on busy days.'];

  cards.push({
    id: 'next',
    type: 'next_steps',
    title: 'Suggested Next Steps',
    items: nextSteps,
    actions:
      input.intent === 'TRACKING'
        ? [
            { label: 'Review Permissions', prompt: 'Show me which phone and health data permissions I should enable first.' },
            { label: 'Sync Activity', prompt: 'Help me sync today’s phone activity data into Steady AI.' },
            { label: 'Explain Reports', prompt: 'Explain how to use synced phone data in my weekly report.' }
          ]
        : input.route.type === 'WORKOUT'
        ? [
            { label: 'Make It Easier', prompt: 'Make this workout easier and more joint-friendly.' },
            { label: 'No Equipment Version', prompt: 'Modify this workout so it uses no equipment.' },
            { label: 'Log After Workout', prompt: 'Help me log this workout after I finish.' }
          ]
        : input.route.type === 'EDUCATOR'
        ? [
            { label: 'Practical Example', prompt: 'Give me one practical example I can apply this week.' },
            { label: 'Cited Clarification', prompt: 'Clarify this with one citation-backed explanation.' },
            { label: 'Non-Confrontational Rephrase', prompt: 'Rephrase this correction in a non-confrontational tone.' }
          ]
        : input.route.agentType === 'MEAL_PLANNER'
          ? [
              { label: '3-Day Plan', prompt: 'Create a simple 3-day plan for this goal.' },
              { label: 'Grocery List', prompt: 'Generate a grocery list for that 3-day plan.' },
              { label: 'Low-Prep Version', prompt: 'Give a lower-prep version with faster meals.' }
            ]
          : input.route.agentType === 'COMMUNITY_GUIDE'
            ? [
                { label: 'Draft Post', prompt: 'Draft one supportive community post I can publish today.' },
                { label: 'Reply Draft', prompt: 'Draft one supportive reply to a peer who missed check-ins.' },
                { label: 'Peer Outreach', prompt: 'Give one short peer outreach message I can send.' }
              ]
            : [
                { label: '7-Day Reset', prompt: 'Give me a 7-day reset plan with small daily actions.' },
                { label: 'Tiny Habit', prompt: 'Suggest one tiny habit I can complete in under 10 minutes daily.' },
                { label: 'Busy Day Fallback', prompt: 'Give a fallback plan for overtime or very busy days.' }
              ]
  });

  return cards;
}

function randomPlanId(): string {
  return `plan-${Math.random().toString(36).slice(2, 10)}`;
}

function parseRequestedDuration(prompt: string): number | null {
  const match = prompt.match(/\b(\d{1,3})\s*(?:min|mins|minute|minutes)\b/i);
  if (!match) {
    return null;
  }

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 5 || value > 120) {
    return null;
  }

  return Math.round(value);
}

function scaleWorkoutDuration(plan: AssistantWorkoutPlan, targetMinutes: number | null): AssistantWorkoutPlan {
  if (!targetMinutes || plan.estimatedTotalMin <= 0) {
    return plan;
  }

  const ratio = Math.max(0.6, Math.min(1.8, targetMinutes / plan.estimatedTotalMin));
  const exercises = plan.exercises.map((exercise) => ({
    ...exercise,
    durationMin: Math.max(2, Math.round(exercise.durationMin * ratio))
  }));

  return {
    ...plan,
    estimatedTotalMin: exercises.reduce((sum, exercise) => sum + exercise.durationMin, 0),
    exercises
  };
}

function buildWorkoutPlan(prompt: string): AssistantWorkoutPlan {
  const normalized = prompt.toLowerCase();
  const lowImpact = /\b(low[-\s]?impact|no[-\s]?impact|joint[-\s]?friendly|knee)\b/.test(normalized);
  const noEquipment = /\b(no equipment|bodyweight|without equipment)\b/.test(normalized);
  const harder = /\b(harder|advanced|intense|challenge)\b/.test(normalized);
  const easier = /\b(easy|easier|beginner|recover|gentle)\b/.test(normalized) || lowImpact;

  const base: AssistantWorkoutExercise[] = [
    {
      name: lowImpact ? 'March in Place' : 'Jumping Jacks',
      durationMin: easier ? 3 : 4,
      reps: easier ? 'Move at a steady pace' : 'Complete 60 total reps',
      note: 'Warm up at a controlled pace and keep breathing steady.'
    },
    {
      name: lowImpact ? 'Bodyweight Box Squat' : 'Bodyweight Squat',
      durationMin: 4,
      reps: harder ? '4 sets of 15 reps' : easier ? '3 sets of 10 reps' : '3 sets of 12 reps',
      note: 'Keep chest upright and push through the heels.'
    },
    {
      name: harder ? 'Push-Up + Shoulder Tap' : 'Push-Up',
      durationMin: 4,
      reps: harder ? '4 sets of 10 reps' : easier ? '3 sets of 6 reps' : '3 sets of 8 reps',
      note: 'Use wall or incline push-ups if floor push-ups are too much.'
    },
    {
      name: lowImpact ? 'Glute Bridge' : 'Reverse Lunge',
      durationMin: 4,
      reps: harder ? '3 sets of 14 reps per side' : easier ? '3 sets of 8 reps per side' : '3 sets of 10 reps per side',
      note: lowImpact ? 'Drive through heels and squeeze glutes at the top.' : 'Keep the front knee stable over mid-foot.'
    },
    {
      name: 'Forearm Plank',
      durationMin: easier ? 3 : 4,
      reps: harder ? '4 sets of 45 seconds' : easier ? '3 sets of 20 seconds' : '3 sets of 30 seconds',
      note: 'Brace the core and keep hips level.'
    }
  ];

  if (harder && !lowImpact) {
    base.push({
      name: 'Mountain Climbers',
      durationMin: 3,
      reps: '3 rounds of 30 seconds',
      note: 'Optional finisher for extra conditioning.'
    });
  }

  const exercises = noEquipment
    ? base.map((exercise) => ({
        ...exercise,
        note: `${exercise.note} No equipment required.`
      }))
    : base;

  const plan: AssistantWorkoutPlan = {
    planId: randomPlanId(),
    title: "Today's Workout Plan",
    focus: lowImpact ? 'Low-impact full-body consistency' : harder ? 'Strength and conditioning' : 'Full-body consistency',
    estimatedTotalMin: exercises.reduce((sum, exercise) => sum + exercise.durationMin, 0),
    exercises
  };

  return scaleWorkoutDuration(plan, parseRequestedDuration(prompt));
}

function formatWorkoutReply(plan: AssistantWorkoutPlan): string {
  const exercises = plan.exercises
    .map((exercise, index) => `${index + 1}. ${exercise.name} - ${exercise.durationMin} minutes. Do ${exercise.reps}. ${exercise.note}`)
    .join('\n');

  return `${plan.title}: ${plan.focus}. Estimated time: ${plan.estimatedTotalMin} minutes.\n\n${exercises}\n\nMove at a conversational pace, stop if pain appears, and choose the easier variation when form breaks.`;
}

function buildFallbackMealPlan(prompt: string): AssistantMealPlan {
  const normalized = prompt.toLowerCase();
  const wantsLowCalorie = /\b(low[-\s]?calorie|light|lean|calorie deficit|weight loss)\b/.test(normalized);
  const wantsChicken = /\bchicken\b/.test(normalized);
  const mealName = /\blunch\b/.test(normalized) ? 'lunch' : /\bdinner\b/.test(normalized) ? 'dinner' : 'meal';
  const protein = wantsChicken ? 'chicken' : 'lean protein';

  const options: AssistantMealOption[] = [
    {
      name: wantsChicken ? 'Lemon Herb Chicken Salad Bowl' : 'Lean Protein Salad Bowl',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
      calories: wantsLowCalorie ? 390 : 480,
      proteinG: wantsChicken ? 42 : 34,
      prepTimeMin: 18,
      tags: ['high protein', 'low calorie', 'fresh'],
      ingredients: [
        `4 oz grilled ${protein}`,
        '3 cups romaine or mixed greens',
        '1 cup cucumber, tomato, and bell pepper',
        '1/4 avocado or 1 tbsp olive-oil vinaigrette',
        'lemon juice, herbs, pepper, and a pinch of salt'
      ],
      steps: [
        `Season and grill or pan-sear the ${protein}.`,
        'Build the greens and vegetables in a bowl.',
        'Slice protein on top and finish with lemon vinaigrette.'
      ],
      note: 'Use extra vegetables for volume without adding many calories.'
    },
    {
      name: wantsChicken ? 'Chicken Lettuce Wrap Plate' : 'Protein Lettuce Wrap Plate',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
      calories: wantsLowCalorie ? 360 : 450,
      proteinG: wantsChicken ? 38 : 30,
      prepTimeMin: 15,
      tags: ['quick', 'low carb', 'crunchy'],
      ingredients: [
        `4 oz shredded ${protein}`,
        'large romaine or butter lettuce leaves',
        'shredded carrots and cabbage',
        '2 tbsp Greek-yogurt herb sauce',
        'optional: 1 small whole-grain pita if you need more carbs'
      ],
      steps: [
        `Warm the ${protein} with garlic, pepper, and paprika.`,
        'Fill lettuce leaves with vegetables and protein.',
        'Drizzle yogurt sauce and serve with optional pita.'
      ],
      note: 'Good when you want a lighter lunch that still feels filling.'
    },
    {
      name: wantsChicken ? 'Chicken Vegetable Soup + Side Salad' : 'Vegetable Protein Soup + Side Salad',
      imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
      calories: wantsLowCalorie ? 330 : 420,
      proteinG: wantsChicken ? 35 : 28,
      prepTimeMin: 25,
      tags: ['warm', 'meal prep', 'filling'],
      ingredients: [
        `4 oz diced ${protein}`,
        '2 cups low-sodium broth',
        'zucchini, spinach, celery, carrots, and onion',
        '1/2 cup beans or cauliflower rice',
        'side salad with vinegar-based dressing'
      ],
      steps: [
        'Simmer broth, vegetables, and seasoning until tender.',
        `Add cooked ${protein} and warm through.`,
        'Serve with a simple side salad.'
      ],
      note: 'Soup is useful for appetite control because it adds volume and hydration.'
    }
  ];

  return {
    planId: `meal-${Math.random().toString(36).slice(2, 10)}`,
    title: `${wantsLowCalorie ? 'Low-calorie' : 'Balanced'} ${wantsChicken ? 'chicken ' : ''}${mealName} ideas`,
    goal: `Create a practical ${mealName} with ${protein}, enough protein to feel satisfied, and simple ingredients.`,
    options
  };
}

function mealTypeFromPrompt(prompt: string): MealType | null {
  const normalized = prompt.toLowerCase();
  if (/\bbreakfast\b/.test(normalized)) return MealType.BREAKFAST;
  if (/\blunch\b/.test(normalized)) return MealType.LUNCH;
  if (/\bdinner\b/.test(normalized)) return MealType.DINNER;
  if (/\bsnack\b/.test(normalized)) return MealType.SNACK;
  return null;
}

function mealLabel(mealType: MealType | null): string {
  if (!mealType) return 'meal';
  return mealType.toLowerCase();
}

function jsonStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

async function buildMealPlan(prompt: string): Promise<AssistantMealPlan> {
  const fallback = buildFallbackMealPlan(prompt);
  const normalized = prompt.toLowerCase();
  const mealType = mealTypeFromPrompt(prompt);
  const prisma = getPrismaClient();

  try {
    const templates = await prisma.mealTemplate.findMany({
      where: {
        isActive: true,
        ...(mealType ? { mealType } : {})
      },
      orderBy: [{ calories: 'asc' }, { proteinG: 'desc' }]
    });

    const ranked = templates
      .map((template) => {
        const haystack = [
          template.name,
          template.description ?? '',
          template.mealType,
          ...template.goalTags,
          ...template.dietTags,
          ...template.cuisineTags,
          ...jsonStringArray(template.ingredients)
        ].join(' ').toLowerCase();

        let score = 0;
        if (mealType && template.mealType === mealType) score += 4;
        if (/\b(low[-\s]?calorie|light|lean|weight loss|calorie deficit)\b/.test(normalized) && template.goalTags.includes('low-calorie')) score += 4;
        if (/\b(high[-\s]?protein|protein)\b/.test(normalized) && template.goalTags.includes('high-protein')) score += 3;
        if (/\b(chicken)\b/.test(normalized) && haystack.includes('chicken')) score += 5;
        if (/\b(vegetarian|veggie)\b/.test(normalized) && template.dietTags.includes('vegetarian')) score += 5;
        if (/\b(vegan)\b/.test(normalized) && template.dietTags.includes('vegan')) score += 5;
        if (/\b(gluten[-\s]?free)\b/.test(normalized) && template.dietTags.includes('gluten-free')) score += 4;
        if (/\b(quick|fast|easy)\b/.test(normalized) && template.prepTimeMin <= 15) score += 3;

        return { template, score };
      })
      .sort((a, b) => b.score - a.score || b.template.calories - a.template.calories);

    const selected = ranked.slice(0, 3).map(({ template }) => ({
      name: template.name,
      imageUrl: template.imageUrl ?? fallback.options[0]?.imageUrl ?? '',
      calories: template.calories,
      proteinG: Number(template.proteinG ?? 0),
      prepTimeMin: template.prepTimeMin,
      tags: [...template.goalTags, ...template.dietTags].slice(0, 4),
      ingredients: jsonStringArray(template.ingredients),
      steps: jsonStringArray(template.steps),
      note: template.description ?? 'Nutrition values are estimates and may vary by ingredient brand and portion size.'
    }));

    if (selected.length === 0) {
      return fallback;
    }

    return {
      planId: `meal-${Math.random().toString(36).slice(2, 10)}`,
      title: `${mealType ? `${mealLabel(mealType)} ` : ''}ideas from your meal catalog`.replace(/^./, (char) => char.toUpperCase()),
      goal: `Picked from ${selected.length} curated meal template${selected.length === 1 ? '' : 's'} based on your request.`,
      options: selected
    };
  } catch {
    return fallback;
  }
}

function formatMealReply(plan: AssistantMealPlan): string {
  const options = plan.options
    .map((option, index) => `${index + 1}. ${option.name} - about ${option.calories} calories, ${option.proteinG}g protein, ${option.prepTimeMin} min prep.`)
    .join('\n');

  return `${plan.title}. ${plan.goal}\n\n${options}\n\nPick the option that fits your appetite today. Adjust portions based on hunger, activity level, and any medical guidance you follow.`;
}

function knownMealItems(mealText: string) {
  const normalized = mealText.toLowerCase();
  if (!normalized.includes('lemon herb chicken salad')) {
    return undefined;
  }

  return [
    {
      name: 'Lemon herb grilled chicken',
      quantity: 4,
      unit: 'oz',
      calories: 190,
      proteinG: 35,
      carbsG: 0,
      fatG: 5,
      confidence: 0.85
    },
    {
      name: 'Mixed greens and vegetables',
      quantity: 3,
      unit: 'cups',
      calories: 80,
      proteinG: 4,
      carbsG: 14,
      fatG: 1,
      confidence: 0.8
    },
    {
      name: 'Light lemon herb dressing',
      quantity: 1,
      unit: 'tbsp',
      calories: 70,
      proteinG: 0,
      carbsG: 2,
      fatG: 7,
      confidence: 0.75
    }
  ];
}

async function getNutritionSummaryToday(userId: string): Promise<AssistantNutritionLog['todaySummary']> {
  const prisma = getPrismaClient();
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const rows = await prisma.nutritionEntry.findMany({
    where: {
      userId,
      consumedAt: { gte: start }
    },
    select: {
      totalCalories: true,
      totalProteinG: true,
      totalCarbsG: true,
      totalFatG: true
    }
  });

  const totals = rows.reduce(
    (acc, row) => {
      acc.calories += row.totalCalories ?? 0;
      acc.proteinG += Number(row.totalProteinG ?? 0);
      acc.carbsG += Number(row.totalCarbsG ?? 0);
      acc.fatG += Number(row.totalFatG ?? 0);
      return acc;
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  return {
    ...totals,
    entries: rows.length
  };
}

export async function assistantRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: AssistantMessageBody }>(
    '/assistant/message',
    { preHandler: optionalAuthenticateRequest },
    async (request, reply) => {
    const message = typeof request.body?.message === 'string' ? request.body.message.trim() : '';
    if (!message) {
      return reply.status(400).send({ error: 'message is required' });
    }

    try {
      const route = pickAssistantRoute(message);
      const intent = detectAssistantIntent(message);

      if (route.type === 'WORKOUT') {
        const run = await steadyAiInternalRuntime.runAgent<
          { message: string; intent: AssistantIntent },
          AssistantWorkoutPlan
        >({
          agentId: route.toolName as AgentCapabilityId,
          userId: request.userId,
          input: { message, intent },
          execute: async (context) => {
            await context.logEvent(AgentEventType.INFO, {
              message: 'Assistant routed request to workout coach',
              intent
            });

            const plan = buildWorkoutPlan(message);
            const [preferences, history7d, latestSession] = request.userId
              ? await Promise.all([
                  getWorkoutPreferences(request.userId).catch(() => null),
                  getWorkoutHistorySummary(request.userId, 7).catch(() => null),
                  getLatestWorkoutSessionInsight(request.userId).catch(() => null)
                ])
              : [null, null, null];

            await context.logEvent(AgentEventType.INFO, {
              message: 'Workout context resolved',
              hasPreferences: Boolean(preferences),
              sessions7d: history7d?.sessions ?? 0,
              latestFeedback: latestSession?.feedback ?? null
            });

            const preferredDuration =
              typeof preferences?.preferredDurationMinutes === 'number' ? preferences.preferredDurationMinutes : null;
            const preferredPlan = preferredDuration ? scaleWorkoutDuration(plan, preferredDuration) : plan;

            return {
              ...preferredPlan,
              exercises: await attachExerciseMedia(preferredPlan.exercises).catch(() => preferredPlan.exercises)
            };
          }
        });

        const plan = run.output;
        const responseText = formatWorkoutReply(plan);
        const cards = buildCards({
          reply: responseText,
          reasoning: [
            { title: 'Route', detail: 'Routed to workout coach because the prompt asked for exercise planning.' },
            { title: 'Plan', detail: `Built ${plan.exercises.length} exercises for about ${plan.estimatedTotalMin} minutes.` },
            { title: 'Safety', detail: 'Used low-impact substitutions when requested and included form cautions.' }
          ],
          route,
          intent
        });

        return reply.status(200).send({
          reply: responseText,
          disclaimer: 'SteadyAI guidance is educational and supportive, not medical advice.',
          routedTo: 'WORKOUT_COACH',
          intent,
          toolInvocations: [route.toolName],
          agentRunId: run.runId,
          workoutPlan: plan,
          cards
        });
      }

      if (route.type === 'EDUCATOR') {
        const run = await steadyAiInternalRuntime.runAgent<
          { message: string; intent: AssistantIntent },
          Awaited<ReturnType<typeof generateEducatorLesson>>
        >({
          agentId: route.toolName as AgentCapabilityId,
          userId: request.userId,
          input: { message, intent },
          execute: async (context) => {
            await context.logEvent(AgentEventType.INFO, {
              message: 'Assistant routed request to educator flow',
              intent
            });
            return generateEducatorLesson({
              userQuestion: message,
              threadContext: ''
            });
          }
        });
        const lesson = run.output;
        const reasoning = [{ title: 'Route', detail: 'Routed to educator flow for evidence-oriented clarification.' }];
        const cards = buildCards({
          reply: lesson.lesson,
          reasoning,
          route,
          intent
        });
        return reply.status(200).send({
          reply: lesson.lesson,
          disclaimer: lesson.disclaimer,
          routedTo: 'EDUCATOR',
          intent,
          toolInvocations: [route.toolName],
          agentRunId: run.runId,
          cards
        });
      }

      if (route.agentType === 'MEAL_PLANNER') {
        if (isNutritionLogRequest(message)) {
          if (!request.userId) {
            return reply.status(401).send({ error: 'Sign in is required to log nutrition.' });
          }

          const mealText = extractMealText(message) || message;
          const entry = await ingestNutrition({
            userId: request.userId,
            inputType: NutritionInputType.TEXT,
            rawText: mealText,
            items: knownMealItems(mealText)
          });
          const todaySummary = await getNutritionSummaryToday(request.userId);
          const nutritionLog: AssistantNutritionLog = {
            entryId: entry.id,
            mealText,
            consumedAt: entry.consumedAt.toISOString(),
            totals: {
              calories: Math.round(entry.totalCalories ?? 0),
              proteinG: Number(entry.totalProteinG ?? 0),
              carbsG: Number(entry.totalCarbsG ?? 0),
              fatG: Number(entry.totalFatG ?? 0)
            },
            todaySummary: {
              calories: Math.round(todaySummary.calories),
              proteinG: Number(todaySummary.proteinG.toFixed(1)),
              carbsG: Number(todaySummary.carbsG.toFixed(1)),
              fatG: Number(todaySummary.fatG.toFixed(1)),
              entries: todaySummary.entries
            }
          };
          const responseText = `Logged ${mealText}. Estimated ${nutritionLog.totals.calories} calories and ${nutritionLog.totals.proteinG}g protein. Today you have ${nutritionLog.todaySummary.entries} nutrition ${nutritionLog.todaySummary.entries === 1 ? 'entry' : 'entries'} logged.`;
          const cards = buildCards({
            reply: responseText,
            reasoning: [
              { title: 'Saved', detail: 'This was treated as a nutrition log request, not a recipe request.' },
              { title: 'Estimate', detail: 'Nutrition totals are estimates based on the meal description.' }
            ],
            route,
            intent
          });

          return reply.status(200).send({
            reply: responseText,
            disclaimer: 'SteadyAI nutrition estimates are educational and approximate, not medical advice.',
            routedTo: 'NUTRITION_LOG',
            intent,
            toolInvocations: ['steadyai.log_nutrition_intake'],
            nutritionLog,
            cards
          });
        }

        const run = await steadyAiInternalRuntime.runAgent<
          { message: string; intent: AssistantIntent; agentType: AgentChatType },
          AssistantMealPlan
        >({
          agentId: route.toolName as AgentCapabilityId,
          userId: request.userId,
          input: { message, intent, agentType: route.agentType },
          execute: async (context) => {
            await context.logEvent(AgentEventType.INFO, {
              message: 'Assistant routed request to meal planning flow',
              intent,
              agentType: route.agentType
            });
            return await buildMealPlan(message);
          }
        });

        const mealPlan = run.output;
        const responseText = formatMealReply(mealPlan);
        const cards = buildCards({
          reply: responseText,
          reasoning: [
            { title: 'Route', detail: 'Routed to nutrition support because the prompt asked for a meal idea.' },
            { title: 'Plan', detail: `Built ${mealPlan.options.length} practical meal options with calories and protein.` },
            { title: 'Visuals', detail: 'Included meal cards with food images and prep details.' }
          ],
          route,
          intent
        });

        return reply.status(200).send({
          reply: responseText,
          disclaimer: 'SteadyAI guidance is educational and supportive, not medical advice.',
          routedTo: route.agentType,
          intent,
          toolInvocations: [route.toolName],
          agentRunId: run.runId,
          mealPlan,
          cards
        });
      }

      const run = await steadyAiInternalRuntime.runAgent<
        { message: string; intent: AssistantIntent; agentType: AgentChatType },
        Awaited<ReturnType<typeof generateAgentChatReply>>
      >({
        agentId: route.toolName as AgentCapabilityId,
        userId: request.userId,
        input: { message, intent, agentType: route.agentType },
        execute: async (context) => {
          await context.logEvent(AgentEventType.INFO, {
            message: 'Assistant routed request to internal agent flow',
            intent,
            agentType: route.agentType
          });
          return generateAgentChatReply(route.agentType, message);
        }
      });
      const result = run.output;
      const cards = buildCards({
        reply: result.text,
        reasoning: result.reasoning,
        route,
        intent
      });

      return reply.status(200).send({
        reply: result.text,
        disclaimer: 'SteadyAI guidance is educational and supportive, not medical advice.',
        routedTo: route.agentType,
        intent,
        toolInvocations: [route.toolName],
        agentRunId: run.runId,
        cards
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to process assistant message' });
    }
  }
  );
}

import type { FastifyInstance } from 'fastify';
import { AgentEventType } from '@prisma/client';

import { steadyAiInternalRuntime } from '../agents/runtime/steadyai-internal.runtime';
import type { AgentCapabilityId } from '../agents/runtime/types';
import { optionalAuthenticateRequest } from '../middleware/auth';
import type { AgentChatType } from '../services/agent-chat.service';
import { generateAgentChatReply } from '../services/agent-chat.service';
import { generateEducatorLesson } from '../services/educator.service';
import { attachExerciseMedia } from '../services/exercise-media.service';
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

function pickAssistantRoute(message: string): AssistantRoute {
  const normalized = message.toLowerCase();

  if (/\b(myth|misinformation|evidence|study|citation|true or false)\b/.test(normalized)) {
    return { type: 'EDUCATOR', toolName: 'steadyai.educator_help' };
  }

  if (/\b(workout|fitness|exercise|training|strength|cardio)\b/.test(normalized)) {
    return { type: 'WORKOUT', toolName: 'steadyai.workout_coach' };
  }

  if (/\b(meal|nutrition|grocery|protein|calorie|diet)\b/.test(normalized)) {
    return { type: 'AGENT', agentType: 'MEAL_PLANNER', toolName: 'steadyai.ask_agent' };
  }

  if (/\b(community|post|reply|engage|peer)\b/.test(normalized)) {
    return { type: 'AGENT', agentType: 'COMMUNITY_GUIDE', toolName: 'steadyai.ask_agent' };
  }

  return { type: 'AGENT', agentType: 'HABIT_COACH', toolName: 'steadyai.ask_agent' };
}

function detectAssistantIntent(message: string): AssistantIntent {
  const normalized = message.toLowerCase();

  if (/\b(myth|misinformation|evidence|study|citation|true or false)\b/.test(normalized)) {
    return 'EDUCATION';
  }
  if (/\b(workout|fitness|exercise|training|routine|strength|cardio)\b/.test(normalized)) {
    return 'FITNESS';
  }
  if (/\b(meal|nutrition|grocery|protein|calorie|diet|macro)\b/.test(normalized)) {
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
      reps: easier ? 'steady pace' : '60 reps',
      note: 'Warm up at a controlled pace and keep breathing steady.'
    },
    {
      name: lowImpact ? 'Bodyweight Box Squat' : 'Bodyweight Squat',
      durationMin: 4,
      reps: harder ? '4 x 15' : easier ? '3 x 10' : '3 x 12',
      note: 'Keep chest upright and push through the heels.'
    },
    {
      name: harder ? 'Push-Up + Shoulder Tap' : 'Push-Up',
      durationMin: 4,
      reps: harder ? '4 x 10' : easier ? '3 x 6' : '3 x 8',
      note: 'Use wall or incline push-ups if floor push-ups are too much.'
    },
    {
      name: lowImpact ? 'Glute Bridge' : 'Reverse Lunge',
      durationMin: 4,
      reps: harder ? '3 x 14/side' : easier ? '3 x 8/side' : '3 x 10/side',
      note: lowImpact ? 'Drive through heels and squeeze glutes at the top.' : 'Keep the front knee stable over mid-foot.'
    },
    {
      name: 'Forearm Plank',
      durationMin: easier ? 3 : 4,
      reps: harder ? '4 x 45 sec' : easier ? '3 x 20 sec' : '3 x 30 sec',
      note: 'Brace the core and keep hips level.'
    }
  ];

  if (harder && !lowImpact) {
    base.push({
      name: 'Mountain Climbers',
      durationMin: 3,
      reps: '3 rounds x 30 sec',
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
    .map((exercise, index) => `${index + 1}. ${exercise.name} - ${exercise.durationMin} min, ${exercise.reps}. ${exercise.note}`)
    .join('\n');

  return `${plan.title}: ${plan.focus}. Estimated time: ${plan.estimatedTotalMin} minutes.\n\n${exercises}\n\nMove at a conversational pace, stop if pain appears, and choose the easier variation when form breaks.`;
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

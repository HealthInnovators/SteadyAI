import { generateCommunityGuideFromJson } from '../agents/communityGuide.agent';
import { generateWeeklyHabitReflectionFromJson } from '../agents/habitCoach.agent';
import { generateThreeDayMealPlanFromJson } from '../agents/mealPlanning.agent';

export type AgentChatType = 'MEAL_PLANNER' | 'HABIT_COACH' | 'COMMUNITY_GUIDE';

export interface AgentChatResult {
  text: string;
  reasoning: Array<{ title: string; detail: string }>;
}

function compactPrompt(prompt: string): string {
  return prompt.replace(/\s+/g, ' ').trim().slice(0, 500);
}

function extractFocusTopics(prompt: string): string[] {
  return prompt
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((x) => x.trim())
    .filter((x) => x.length >= 4)
    .slice(0, 5);
}

function summarizeMealPlan(result: Awaited<ReturnType<typeof generateThreeDayMealPlanFromJson>>): string {
  const preview = result.days
    .map((day) => {
      const mainMeals = day.meals.filter((meal) => meal.slot !== 'snack').slice(0, 2);
      const menu = mainMeals.map((meal) => meal.name).join(', ');
      return `Day ${day.day}: ${menu}`;
    })
    .join(' | ');

  const groceryPreview = result.groceryList.slice(0, 5).map((item) => item.item).join(', ');
  return `${result.reasoning.approach} ${preview}. Grocery starters: ${groceryPreview}.`;
}

function summarizeHabitReflection(result: Awaited<ReturnType<typeof generateWeeklyHabitReflectionFromJson>>): string {
  return `${result.weeklyReflection} Next step: ${result.habitAdjustment.title}. ${result.habitAdjustment.action}`;
}

function summarizeCommunityGuide(result: Awaited<ReturnType<typeof generateCommunityGuideFromJson>>): string {
  const post = result.suggestedPosts[0];
  const peer = result.suggestedPeers[0];

  const postLine = post ? `Post idea: ${post.title} - ${post.contentPrompt}` : 'Post idea: share one small win and one next step.';
  const peerLine = peer
    ? `Peer outreach: message ${peer.peerUserId} with "${peer.outreachPrompt}"`
    : 'Peer outreach: send one supportive check-in to a community member.';

  return `${result.engagementApproach} ${postLine} ${peerLine}`;
}

export async function generateAgentChatReply(agentType: AgentChatType, prompt: string): Promise<AgentChatResult> {
  const normalizedPrompt = compactPrompt(prompt);

  if (!normalizedPrompt) {
    throw new Error('prompt is required');
  }

  if (agentType === 'MEAL_PLANNER') {
    const userSummary = {
      schemaVersion: 'v1',
      generatedAt: new Date().toISOString(),
      userId: 'agent-user',
      profile: {
        onboardingCompleted: true,
        primaryGoal: normalizedPrompt,
        experienceLevel: null,
        dietaryPreferences: [],
        timeAvailability: null
      },
      challengeActivity: {
        activeChallengeId: null,
        participationStatus: null,
        checkIns: {
          total: 0,
          completed: 0,
          partial: 0,
          skipped: 0,
          completionRate: 0,
          lastCheckInAt: null
        }
      },
      communityEngagement: {
        postsCount: 0,
        reactionsGivenCount: 0,
        reactionsReceivedCount: 0,
        lastPostAt: null
      },
      purchaseHistory: {
        totalPurchases: 0,
        totalSpentCents: 0,
        averageOrderValueCents: 0,
        lastPurchaseAt: null,
        topProductIds: []
      },
      safety: {
        piiIncluded: false,
        rawHealthDataIncluded: false
      }
    };

    const result = await generateThreeDayMealPlanFromJson(userSummary);
    return {
      text: summarizeMealPlan(result),
      reasoning: [
        { title: 'Prompt parsed', detail: `Captured planning focus: "${normalizedPrompt}".` },
        { title: 'Approach', detail: result.reasoning.approach },
        { title: 'Safety', detail: result.reasoning.safetyNote }
      ]
    };
  }

  if (agentType === 'HABIT_COACH') {
    const summary = {
      challengeId: null,
      participationStatus: 'JOINED',
      periodDays: 7,
      totalCheckIns: 0,
      completedCheckIns: 0,
      partialCheckIns: 0,
      skippedCheckIns: 0,
      completionRate: 0,
      lastCheckInAt: null,
      note: normalizedPrompt
    };
    const result = await generateWeeklyHabitReflectionFromJson(summary);
    return {
      text: summarizeHabitReflection(result),
      reasoning: [
        { title: 'Tone', detail: 'Supportive and non-judgmental language applied.' },
        { title: 'Focus', detail: `Weekly adjustment centered around: "${normalizedPrompt}".` },
        { title: 'Actionability', detail: `Suggested difficulty: ${result.habitAdjustment.difficulty}.` }
      ]
    };
  }

  const engagementSummary = {
    userId: 'agent-user',
    postsCount: 0,
    reactionsGivenCount: 0,
    reactionsReceivedCount: 0,
    lastPostAt: null,
    focusTopics: extractFocusTopics(normalizedPrompt),
    availablePeers: []
  };
  const result = await generateCommunityGuideFromJson(engagementSummary);

  return {
    text: summarizeCommunityGuide(result),
    reasoning: [
      { title: 'Intent', detail: `Used your context to shape community suggestions: "${normalizedPrompt}".` },
      { title: 'Fairness', detail: 'No popularity ranking was used in recommendations.' },
      { title: 'Execution', detail: 'Selected one post prompt and one outreach prompt for low-friction action.' }
    ]
  };
}

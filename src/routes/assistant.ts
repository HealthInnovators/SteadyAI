import type { FastifyInstance } from 'fastify';

import type { AgentChatType } from '../services/agent-chat.service';
import { generateAgentChatReply } from '../services/agent-chat.service';
import { generateEducatorLesson } from '../services/educator.service';

interface AssistantMessageBody {
  message: string;
}

type AssistantRoute =
  | { type: 'AGENT'; agentType: AgentChatType; toolName: 'steadyai.ask_agent' }
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

function pickAssistantRoute(message: string): AssistantRoute {
  const normalized = message.toLowerCase();

  if (/\b(myth|misinformation|evidence|study|citation|true or false)\b/.test(normalized)) {
    return { type: 'EDUCATOR', toolName: 'steadyai.educator_help' };
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

export async function assistantRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: AssistantMessageBody }>('/assistant/message', async (request, reply) => {
    const message = typeof request.body?.message === 'string' ? request.body.message.trim() : '';
    if (!message) {
      return reply.status(400).send({ error: 'message is required' });
    }

    try {
      const route = pickAssistantRoute(message);
      const intent = detectAssistantIntent(message);

      if (route.type === 'EDUCATOR') {
        const lesson = await generateEducatorLesson({
          userQuestion: message,
          threadContext: ''
        });
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
          cards
        });
      }

      const result = await generateAgentChatReply(route.agentType, message);
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
        cards
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to process assistant message' });
    }
  });
}

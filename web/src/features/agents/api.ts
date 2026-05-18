import { createApiClient } from '@/lib/api';
import type { AssistantCard, AssistantIntent, ReasoningStep, WorkoutPlan } from './types';

interface AgentReplyResponse {
  reply: string;
  routedTo: string;
  intent?: AssistantIntent;
  toolInvocations: string[];
  disclaimer?: string;
  cards?: AssistantCard[];
  workoutPlan?: WorkoutPlan;
}

const AGENT_REQUEST_TIMEOUT_MS = 30000;

export async function requestAgentReply(
  prompt: string,
  token?: string | null
): Promise<{
  text: string;
  intent?: AssistantIntent;
  reasoning?: ReasoningStep[];
  cards?: AssistantCard[];
  workoutPlan?: WorkoutPlan;
}> {
  const api = createApiClient(token ?? undefined);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), AGENT_REQUEST_TIMEOUT_MS);

  try {
    const response = await api.post<AgentReplyResponse, { message: string }>('/api/assistant/message', {
      body: {
        message: prompt
      },
      signal: controller.signal
    });
    const reasoning = (response.cards || [])
      .filter((card) => card.type === 'reasoning')
      .flatMap((card) => (card.items || []).map((item) => {
        const split = item.split(':');
        if (split.length < 2) {
          return { title: 'Note', detail: item };
        }
        return { title: split[0].trim(), detail: split.slice(1).join(':').trim() };
      }));

    return {
      text: response.reply,
      intent: response.intent,
      reasoning,
      cards: response.cards,
      workoutPlan: response.workoutPlan
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

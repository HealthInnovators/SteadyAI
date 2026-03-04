import { createApiClient } from '@/lib/api';
import type { AssistantCard, ReasoningStep } from './types';

interface AgentReplyResponse {
  reply: string;
  routedTo: string;
  toolInvocations: string[];
  disclaimer?: string;
  cards?: AssistantCard[];
}

const AGENT_REQUEST_TIMEOUT_MS = 12000;

export async function requestAgentReply(prompt: string): Promise<{ text: string; reasoning?: ReasoningStep[]; cards?: AssistantCard[] }> {
  const api = createApiClient();
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
      reasoning,
      cards: response.cards
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

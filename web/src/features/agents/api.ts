import { createApiClient } from '@/lib/api';
import type { AgentType, ReasoningStep } from './types';

interface AgentReplyResponse {
  text: string;
  reasoning?: ReasoningStep[];
}

const AGENT_REQUEST_TIMEOUT_MS = 12000;

export async function requestAgentReply(agentType: AgentType, prompt: string): Promise<AgentReplyResponse> {
  const api = createApiClient();
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), AGENT_REQUEST_TIMEOUT_MS);

  try {
    return await api.post<AgentReplyResponse, { agentType: AgentType; prompt: string }>('/api/agents/respond', {
      body: {
        agentType,
        prompt
      },
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

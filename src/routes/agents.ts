import type { FastifyInstance } from 'fastify';

import { generateAgentChatReply, type AgentChatType } from '../services/agent-chat.service';

interface AgentChatBody {
  agentType: AgentChatType;
  prompt: string;
}

const ALLOWED_AGENT_TYPES = new Set<AgentChatType>(['MEAL_PLANNER', 'HABIT_COACH', 'COMMUNITY_GUIDE']);

export async function agentRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: AgentChatBody }>('/agents/respond', async (request, reply) => {
    const { agentType, prompt } = request.body ?? {};

    if (!agentType || !ALLOWED_AGENT_TYPES.has(agentType)) {
      return reply.status(400).send({ error: 'agentType must be one of MEAL_PLANNER, HABIT_COACH, COMMUNITY_GUIDE' });
    }

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return reply.status(400).send({ error: 'prompt is required' });
    }

    try {
      const result = await generateAgentChatReply(agentType, prompt);
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to generate agent response' });
    }
  });
}

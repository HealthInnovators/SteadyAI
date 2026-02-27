import type { FastifyInstance } from 'fastify';

import type { BuildMcpUserSummaryInput } from '../mcp/userSummary';
import { generateMcpUserSummary } from '../services/mcp-user-summary.service';

interface McpUserSummaryBody {
  profile: BuildMcpUserSummaryInput['profile'];
  communityEngagement?: BuildMcpUserSummaryInput['communityEngagement'];
  purchaseHistory?: BuildMcpUserSummaryInput['purchaseHistory'];
}

export async function mcpRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: McpUserSummaryBody }>(
    '/mcp/user-summary',
    async (request, reply) => {
      const body = request.body;

      if (!body?.profile || typeof body.profile !== 'object') {
        return reply.status(400).send({ error: 'profile is required' });
      }

      if (typeof body.profile.userId !== 'string' || body.profile.userId.trim().length === 0) {
        return reply.status(400).send({ error: 'profile.userId is required' });
      }

      try {
        const summary = generateMcpUserSummary({
          profile: body.profile,
          communityEngagement: body.communityEngagement,
          purchaseHistory: body.purchaseHistory
        });

        return reply.status(200).send(summary);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate MCP user summary';
        return reply.status(400).send({ error: message });
      }
    }
  );
}

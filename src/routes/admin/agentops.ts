import type { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../../db/prisma';
import { authenticateRequest } from '../../middleware/auth';
import { UserRole, type AgentRun, type AgentDefinition, type AgentEvent } from '@prisma/client';

export async function agentOpsRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/admin/agentops/runs',
    {
      preHandler: [authenticateRequest]
    },
    async (request, reply) => {
      // Manual RBAC check for ADMIN
      const prisma = getPrismaClient();
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId: request.userId, role: UserRole.ADMIN }
      });

      if (!membership) {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const runs = await prisma.agentRun.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
            agentDefinition: true,
            events: {
                orderBy: { createdAt: 'asc' }
            }
        }
      });

      return runs.map((run: AgentRun & { agentDefinition: AgentDefinition, events: AgentEvent[] }) => ({
        ...run,
        // Summary only, mask sensitive data
        input: 'Sensitive input masked',
        output: typeof run.output === 'object' ? 'Summary available' : run.output,
        error: run.error ? 'Error summary available' : null
      }));
    }
  );
}

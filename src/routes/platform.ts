import type { FastifyInstance } from 'fastify';

import { getPrismaClient } from '../db/prisma';
import { authenticateRequest } from '../middleware/auth';
import type { PlatformContext } from '../types/platform';
import { resolveUserWorkspace } from '../services/workspace.service';

export async function platformRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/platform/context',
    {
      preHandler: [authenticateRequest]
    },
    async (request, reply): Promise<PlatformContext> => {
      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { id: request.userId },
        select: {
          id: true,
          email: true,
          displayName: true,
          onboardingCompleted: true
        }
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const { workspace, membership } = await resolveUserWorkspace(user.id);

      const context: PlatformContext = {
        userIdentity: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          onboardingCompleted: user.onboardingCompleted
        },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          role: membership.role,
        },
        enabledModules: ['HOME', 'COACHING', 'WORKOUTS', 'NUTRITION', 'REPORTS', 'COMMUNITY', 'STORE', 'SETTINGS']
      };

      return context;
    }
  );
}

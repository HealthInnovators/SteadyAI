import type { FastifyInstance } from 'fastify';

import { agentRoutes } from './agents';
import { challengeRoutes } from './challenges';
import { communityRoutes } from './community';
import { educatorRoutes } from './educator';
import { healthRoutes } from './health';
import { mcpRoutes } from './mcp';
import { notificationRoutes } from './notifications';
import { onboardingRoutes } from './onboarding';
import { nutritionRoutes } from './nutrition';
import { storeRoutes } from './store';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(agentRoutes);
  await fastify.register(challengeRoutes);
  await fastify.register(communityRoutes);
  await fastify.register(educatorRoutes);
  await fastify.register(healthRoutes);
  await fastify.register(mcpRoutes);
  await fastify.register(notificationRoutes);
  await fastify.register(onboardingRoutes);
  await fastify.register(nutritionRoutes);
  await fastify.register(storeRoutes);
}

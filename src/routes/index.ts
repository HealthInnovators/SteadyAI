import type { FastifyInstance } from 'fastify';

import { agentRoutes } from './agents';
import { appsMcpRoutes } from './apps-mcp';
import { challengeRoutes } from './challenges';
import { communityRoutes } from './community';
import { educatorRoutes } from './educator';
import { healthRoutes } from './health';
import { mcpRoutes } from './mcp';
import { notificationRoutes } from './notifications';
import { onboardingRoutes } from './onboarding';
import { nutritionRoutes } from './nutrition';
import { reportsRoutes } from './reports';
import { storeRoutes } from './store';
import { workoutRoutes } from './workouts';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(agentRoutes);
  await fastify.register(appsMcpRoutes);
  await fastify.register(challengeRoutes);
  await fastify.register(communityRoutes);
  await fastify.register(educatorRoutes);
  await fastify.register(healthRoutes);
  await fastify.register(mcpRoutes);
  await fastify.register(notificationRoutes);
  await fastify.register(onboardingRoutes);
  await fastify.register(nutritionRoutes);
  await fastify.register(reportsRoutes);
  await fastify.register(storeRoutes);
  await fastify.register(workoutRoutes);
}

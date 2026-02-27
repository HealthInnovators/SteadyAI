import type { FastifyInstance } from 'fastify';

import { challengeRoutes } from './challenges';
import { communityRoutes } from './community';
import { healthRoutes } from './health';
import { onboardingRoutes } from './onboarding';
import { nutritionRoutes } from './nutrition';
import { storeRoutes } from './store';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(challengeRoutes);
  await fastify.register(communityRoutes);
  await fastify.register(healthRoutes);
  await fastify.register(onboardingRoutes);
  await fastify.register(nutritionRoutes);
  await fastify.register(storeRoutes);
}

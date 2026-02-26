import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';

import { optionalAuthenticateRequest } from '../middleware/auth';
import { completeOnboarding } from '../services/onboarding.service';

interface OnboardingBody {
  primaryGoal: string;
  experienceLevel: string;
  dietaryPreferences: string[];
  timeAvailability: string;
}

export async function onboardingRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: OnboardingBody }>(
    '/onboarding',
    { preHandler: optionalAuthenticateRequest },
    async (request, reply) => {
      const userId = request.userId;
      const userEmail = request.userEmail;
      const { primaryGoal, experienceLevel, dietaryPreferences, timeAvailability } = request.body;

      // Generate a proper UUID if user is not authenticated
      const finalUserId = userId || randomUUID();

      if (!primaryGoal || !experienceLevel || !timeAvailability || !Array.isArray(dietaryPreferences)) {
        return reply.status(400).send({ error: 'primaryGoal, experienceLevel, dietaryPreferences[], and timeAvailability are required' });
      }

      try {
        const summary = await completeOnboarding({
          userId: finalUserId,
          email: userEmail,
          primaryGoal,
          experienceLevel,
          dietaryPreferences,
          timeAvailability
        });

        return reply.status(200).send(summary);
      } catch (error) {
        request.log.error(error);
        return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed onboarding' });
      }
    }
  );
}

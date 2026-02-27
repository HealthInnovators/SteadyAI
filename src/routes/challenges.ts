import { DailyParticipationStatus } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

import { authenticateRequest, optionalAuthenticateRequest } from '../middleware/auth';
import { ALLOWED_DAILY_STATUSES, createDailyChallengeCheckIn } from '../services/challenge-checkin.service';
import { getPrismaClient } from '../db/prisma';

interface ChallengeCheckInBody {
  status: DailyParticipationStatus;
}

export async function challengeRoutes(fastify: FastifyInstance): Promise<void> {
  // Get all challenges
  fastify.get(
    '/challenges',
    { preHandler: optionalAuthenticateRequest },
    async (request, reply) => {
      const prisma = getPrismaClient();

      try {
        const challenges = await prisma.challenge.findMany({
          where: {
            status: 'ACTIVE'
          },
          include: {
            group: true,
            creator: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            },
            participations: request.userId
              ? {
                  where: { userId: request.userId },
                  select: { status: true }
                }
              : false
          },
          orderBy: { createdAt: 'desc' }
        });

        return reply.status(200).send(challenges);
      } catch (error) {
        request.log.error(error);
        return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to fetch challenges' });
      }
    }
  );

  // Get single challenge by ID
  fastify.get<{ Params: { id: string } }>(
    '/challenges/:id',
    { preHandler: optionalAuthenticateRequest },
    async (request, reply) => {
      const prisma = getPrismaClient();
      const { id } = request.params;

      try {
        const challenge = await prisma.challenge.findUnique({
          where: { id },
          include: {
            group: true,
            creator: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            },
            participations: request.userId
              ? {
                  where: { userId: request.userId },
                  select: { status: true }
                }
              : false
          }
        });

        if (!challenge) {
          return reply.status(404).send({ error: 'Challenge not found' });
        }

        return reply.status(200).send(challenge);
      } catch (error) {
        request.log.error(error);
        return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to fetch challenge' });
      }
    }
  );

  fastify.post<{ Body: ChallengeCheckInBody }>(
    '/challenges/check-in',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const userId = request.userId;
      const { status } = request.body;

      if (!userId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      if (!status || !ALLOWED_DAILY_STATUSES.has(status)) {
        return reply.status(400).send({ error: 'status must be one of COMPLETED, PARTIAL, SKIPPED' });
      }

      try {
        const summary = await createDailyChallengeCheckIn({
          userId,
          status
        });

        return reply.status(201).send(summary);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save check-in';

        if (message.includes('already submitted')) {
          return reply.status(409).send({ error: message });
        }

        if (message.includes('No active challenge participation')) {
          return reply.status(403).send({ error: message });
        }

        request.log.error(error);
        return reply.status(400).send({ error: message });
      }
    }
  );
}


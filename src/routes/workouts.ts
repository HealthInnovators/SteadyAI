import type { FastifyInstance } from 'fastify';

import { logWorkoutSessionSummary } from '../services/workout-session.service';

interface WorkoutSessionSummaryBody {
  userId: string;
  sessionId: string;
  startedAt?: string;
  completedAt?: string;
  totalDurationMinutes: number;
  completedExercises: number;
  totalExercises: number;
  workoutPlan?: Record<string, unknown>;
  feedback?: 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD';
  sourceApp?: string;
  deviceInstallId?: string;
}

export async function workoutRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: WorkoutSessionSummaryBody }>('/workouts/session-summary', async (request, reply) => {
    const body = request.body;
    if (!body?.userId || typeof body.userId !== 'string') {
      return reply.status(400).send({ error: 'userId is required' });
    }
    if (!body?.sessionId || typeof body.sessionId !== 'string') {
      return reply.status(400).send({ error: 'sessionId is required' });
    }
    if (typeof body.totalDurationMinutes !== 'number') {
      return reply.status(400).send({ error: 'totalDurationMinutes must be a number' });
    }
    if (typeof body.completedExercises !== 'number' || typeof body.totalExercises !== 'number') {
      return reply.status(400).send({ error: 'completedExercises and totalExercises must be numbers' });
    }

    try {
      const result = await logWorkoutSessionSummary({
        userId: body.userId,
        sessionId: body.sessionId,
        startedAt: body.startedAt,
        completedAt: body.completedAt,
        totalDurationMinutes: body.totalDurationMinutes,
        completedExercises: body.completedExercises,
        totalExercises: body.totalExercises,
        workoutPlan: body.workoutPlan,
        feedback: body.feedback,
        sourceApp: body.sourceApp,
        deviceInstallId: body.deviceInstallId
      });
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({ error: error instanceof Error ? error.message : 'Failed to save workout summary' });
    }
  });
}

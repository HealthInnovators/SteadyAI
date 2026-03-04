import type { FastifyInstance } from 'fastify';
import { getPrismaClient } from '../db/prisma';
import { createHealthMetricsIngestionService } from '../services/health-connect.service';

interface HealthConnectSummaryBody {
  userId: string;
  date: string;
  steps: number;
  activityMinutes: number;
  sourceApp?: string;
  deviceInstallId?: string;
}

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
  const ingestionService = createHealthMetricsIngestionService();

  fastify.get('/health', async () => {
    return { status: 'ok' };
  });

  fastify.post<{ Body: HealthConnectSummaryBody }>('/health/connect/summary', async (request, reply) => {
    const body = request.body;

    if (!body?.userId || typeof body.userId !== 'string') {
      return reply.status(400).send({ error: 'userId is required' });
    }

    if (!body?.date || typeof body.date !== 'string') {
      return reply.status(400).send({ error: 'date is required' });
    }

    if (typeof body.steps !== 'number' || typeof body.activityMinutes !== 'number') {
      return reply.status(400).send({ error: 'steps and activityMinutes must be numbers' });
    }

    try {
      const userExists = await prisma.user.findUnique({
        where: { id: body.userId },
        select: { id: true }
      });

      if (!userExists) {
        return reply.status(404).send({ error: 'User not found. Complete onboarding first.' });
      }

      const result = await ingestionService.ingestAggregatedMetrics({
        userId: body.userId,
        date: body.date,
        steps: body.steps,
        activityMinutes: body.activityMinutes,
        sourceApp: body.sourceApp,
        deviceInstallId: body.deviceInstallId
      });

      return reply.status(200).send(result);
    } catch (error) {
      request.log.error(error);
      return reply.status(400).send({
        error: error instanceof Error ? error.message : 'Failed to ingest Health Connect summary'
      });
    }
  });
}

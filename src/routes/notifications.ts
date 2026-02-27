import type { FastifyInstance } from 'fastify';

import { authenticateRequest } from '../middleware/auth';
import {
  type NotificationOptInSettings,
  type NotificationSchedulePreferences,
  NotificationSchedulerService
} from '../services/notification-scheduler.service';
import { ReplyNotificationListenerService } from '../services/reply-notification-listener.service';

interface DailyReminderBody {
  userId?: string;
  optIn: NotificationOptInSettings;
  schedule: NotificationSchedulePreferences;
  dispatchNow?: boolean;
}

interface ReplyEventBody {
  actorUserId?: string;
  targetUserId: string;
  targetTimezone?: string;
  targetOptIn: boolean;
  replyCount?: number;
  occurredAtUtc?: string;
}

export async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
  const scheduler = new NotificationSchedulerService();
  const replyListener = new ReplyNotificationListenerService();

  fastify.post<{ Body: DailyReminderBody }>(
    '/notifications/daily-check-in/schedule',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const authenticatedUserId = request.userId;
      const body = request.body;
      const finalUserId = body.userId ?? authenticatedUserId;

      if (!finalUserId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      if (body.userId && authenticatedUserId && body.userId !== authenticatedUserId) {
        return reply.status(403).send({ error: 'userId does not match authenticated user' });
      }

      if (!body.optIn || !body.schedule) {
        return reply.status(400).send({ error: 'optIn and schedule are required' });
      }

      try {
        const profile = {
          userId: finalUserId,
          optIn: body.optIn,
          schedule: body.schedule
        };

        const job = scheduler.buildDailyCheckInReminderJob(profile);
        if (!job) {
          return reply.status(200).send({
            scheduled: false,
            reason: 'User is not opted in to daily check-in reminders.'
          });
        }

        if (body.dispatchNow) {
          const dispatched = await scheduler.dispatchJobs([job]);
          return reply.status(200).send({
            scheduled: true,
            job,
            dispatched: dispatched[0] ?? null
          });
        }

        return reply.status(200).send({
          scheduled: true,
          job,
          dispatched: null
        });
      } catch (error) {
        request.log.error(error);
        return reply
          .status(400)
          .send({ error: error instanceof Error ? error.message : 'Failed to schedule daily check-in reminder' });
      }
    }
  );

  fastify.post<{ Body: ReplyEventBody }>(
    '/notifications/replies/event',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const authenticatedUserId = request.userId;
      if (!authenticatedUserId) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const body = request.body;
      const actorUserId = body.actorUserId ?? authenticatedUserId;

      if (!body.targetUserId || typeof body.targetUserId !== 'string') {
        return reply.status(400).send({ error: 'targetUserId is required' });
      }

      if (typeof body.targetOptIn !== 'boolean') {
        return reply.status(400).send({ error: 'targetOptIn boolean is required' });
      }

      if (actorUserId !== authenticatedUserId) {
        return reply.status(403).send({ error: 'actorUserId does not match authenticated user' });
      }

      try {
        const result = await replyListener.onReplyCreated({
          actorUserId,
          targetUserId: body.targetUserId,
          targetTimezone: body.targetTimezone,
          targetOptIn: body.targetOptIn,
          replyCount: body.replyCount,
          occurredAtUtc: body.occurredAtUtc
        });

        return reply.status(200).send(result);
      } catch (error) {
        request.log.error(error);
        return reply.status(400).send({
          error: error instanceof Error ? error.message : 'Failed to process reply notification event'
        });
      }
    }
  );
}

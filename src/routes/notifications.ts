import { NotificationDeliveryStatus, NotificationType, Prisma } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

import { getPrismaClient } from '../db/prisma';
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
  replyCount?: number;
  occurredAtUtc?: string;
}

export async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
  const prisma = getPrismaClient();
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
        await prisma.userNotificationSettings.upsert({
          where: { userId: finalUserId },
          create: {
            userId: finalUserId,
            dailyCheckInReminder: body.optIn.dailyCheckInReminder,
            weeklyReflection: body.optIn.weeklyReflection,
            communityReplies: body.optIn.communityReplies,
            timezone: body.schedule.timezone,
            dailyReminderHourLocal: body.schedule.dailyReminderHourLocal,
            weeklyReflectionDayLocal: body.schedule.weeklyReflectionDayLocal,
            weeklyReflectionHourLocal: body.schedule.weeklyReflectionHourLocal
          },
          update: {
            dailyCheckInReminder: body.optIn.dailyCheckInReminder,
            weeklyReflection: body.optIn.weeklyReflection,
            communityReplies: body.optIn.communityReplies,
            timezone: body.schedule.timezone,
            dailyReminderHourLocal: body.schedule.dailyReminderHourLocal,
            weeklyReflectionDayLocal: body.schedule.weeklyReflectionDayLocal,
            weeklyReflectionHourLocal: body.schedule.weeklyReflectionHourLocal
          }
        });

        const profile = {
          userId: finalUserId,
          optIn: body.optIn,
          schedule: body.schedule
        };

        const job = scheduler.buildDailyCheckInReminderJob(profile);
        if (!job) {
          await prisma.notificationDispatchLog.create({
            data: {
              userId: finalUserId,
              type: NotificationType.DAILY_CHECK_IN_REMINDER,
              status: NotificationDeliveryStatus.SKIPPED,
              channel: 'IN_APP',
              scheduledAtUtc: new Date(),
              dispatchedAtUtc: new Date(),
              reason: 'User is not opted in to daily check-in reminders.'
            }
          });
          return reply.status(200).send({
            scheduled: false,
            reason: 'User is not opted in to daily check-in reminders.'
          });
        }

        if (body.dispatchNow) {
          const dispatched = await scheduler.dispatchJobs([job]);
          const dispatch = dispatched[0] ?? null;

          await prisma.notificationDispatchLog.create({
            data: {
              userId: finalUserId,
              type: NotificationType.DAILY_CHECK_IN_REMINDER,
              status: dispatch?.delivered ? NotificationDeliveryStatus.SENT : NotificationDeliveryStatus.FAILED,
              channel: 'IN_APP',
              scheduledAtUtc: new Date(job.scheduledAtUtc),
              dispatchedAtUtc: dispatch?.dispatchedAtUtc ? new Date(dispatch.dispatchedAtUtc) : new Date(),
              dedupeKey: `${job.jobId}:${Date.now()}`,
              payload: job.payload as Prisma.InputJsonValue,
              reason: dispatch?.delivered ? null : dispatch?.message ?? 'Failed to dispatch daily reminder'
            }
          });

          return reply.status(200).send({
            scheduled: true,
            job,
            dispatched: dispatch
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

      if (actorUserId !== authenticatedUserId) {
        return reply.status(403).send({ error: 'actorUserId does not match authenticated user' });
      }

      try {
        const result = await replyListener.onReplyCreated({
          actorUserId,
          targetUserId: body.targetUserId,
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

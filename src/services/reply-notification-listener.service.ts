import { NotificationDeliveryStatus, NotificationType } from '@prisma/client';

import {
  ConsoleNotificationDispatcher,
  NotificationSchedulerService,
  type NotificationDispatchResult,
  type NotificationJob
} from './notification-scheduler.service';
import { getPrismaClient } from '../db/prisma';

export interface ReplyCreatedEvent {
  actorUserId: string;
  targetUserId: string;
  replyCount?: number;
  occurredAtUtc?: string;
}

export interface ReplyNotificationHandleResult {
  notified: boolean;
  reason?: string;
  job?: NotificationJob;
  dispatch?: NotificationDispatchResult;
}

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

export class ReplyNotificationListenerService {
  private readonly scheduler: NotificationSchedulerService;

  constructor(scheduler?: NotificationSchedulerService) {
    this.scheduler = scheduler ?? new NotificationSchedulerService(new ConsoleNotificationDispatcher());
  }

  async onReplyCreated(event: ReplyCreatedEvent): Promise<ReplyNotificationHandleResult> {
    const prisma = getPrismaClient();
    const actorUserId = event.actorUserId.trim();
    const targetUserId = event.targetUserId.trim();

    if (!actorUserId || !targetUserId) {
      return { notified: false, reason: 'actorUserId and targetUserId are required' };
    }

    if (actorUserId === targetUserId) {
      return { notified: false, reason: 'Self-replies do not trigger notifications' };
    }

    const settings = await prisma.userNotificationSettings.findUnique({
      where: { userId: targetUserId },
      select: {
        communityReplies: true,
        timezone: true,
        communityReplyCooldownMinutes: true
      }
    });

    if (!settings?.communityReplies) {
      const reason = 'Target user is not opted in for reply notifications';
      await prisma.notificationDispatchLog.create({
        data: {
          userId: targetUserId,
          type: NotificationType.COMMUNITY_REPLIES,
          status: NotificationDeliveryStatus.SKIPPED,
          channel: 'IN_APP',
          scheduledAtUtc: new Date(),
          dispatchedAtUtc: new Date(),
          payload: {
            actorUserId,
            replyCount: Math.max(1, Math.floor(event.replyCount ?? 1)),
            occurredAtUtc: event.occurredAtUtc ?? null
          },
          reason
        }
      });
      return { notified: false, reason };
    }

    const now = new Date();
    const cooldownMs = Math.max(1, settings.communityReplyCooldownMinutes) * 60 * 1000;

    const lastSent = await prisma.notificationDispatchLog.findFirst({
      where: {
        userId: targetUserId,
        type: NotificationType.COMMUNITY_REPLIES,
        status: NotificationDeliveryStatus.SENT
      },
      orderBy: { dispatchedAtUtc: 'desc' },
      select: { dispatchedAtUtc: true }
    });

    if (lastSent && now.getTime() - lastSent.dispatchedAtUtc.getTime() < cooldownMs) {
      await prisma.notificationDispatchLog.create({
        data: {
          userId: targetUserId,
          type: NotificationType.COMMUNITY_REPLIES,
          status: NotificationDeliveryStatus.SKIPPED,
          channel: 'IN_APP',
          scheduledAtUtc: now,
          dispatchedAtUtc: now,
          payload: {
            actorUserId,
            replyCount: Math.max(1, Math.floor(event.replyCount ?? 1)),
            occurredAtUtc: event.occurredAtUtc ?? null
          },
          reason: 'Cooldown active to prevent spam'
        }
      });
      return { notified: false, reason: 'Cooldown active to prevent spam' };
    }

    const windowStart = new Date(now.getTime() - WINDOW_MS);
    const recentSentCount = await prisma.notificationDispatchLog.count({
      where: {
        userId: targetUserId,
        type: NotificationType.COMMUNITY_REPLIES,
        status: NotificationDeliveryStatus.SENT,
        dispatchedAtUtc: { gte: windowStart }
      }
    });

    if (recentSentCount >= MAX_PER_WINDOW) {
      await prisma.notificationDispatchLog.create({
        data: {
          userId: targetUserId,
          type: NotificationType.COMMUNITY_REPLIES,
          status: NotificationDeliveryStatus.SKIPPED,
          channel: 'IN_APP',
          scheduledAtUtc: now,
          dispatchedAtUtc: now,
          payload: {
            actorUserId,
            replyCount: Math.max(1, Math.floor(event.replyCount ?? 1)),
            occurredAtUtc: event.occurredAtUtc ?? null
          },
          reason: 'Hourly notification limit reached for target user'
        }
      });
      return { notified: false, reason: 'Hourly notification limit reached for target user' };
    }

    const jobs = this.scheduler.buildCommunityReplyJobs(
      [
        {
          userId: targetUserId,
          replyCount: Math.max(1, Math.floor(event.replyCount ?? 1)),
          latestReplyAtUtc: event.occurredAtUtc
        }
      ],
      { [targetUserId]: settings.timezone.trim() || 'UTC' }
    );

    if (jobs.length === 0) {
      return { notified: false, reason: 'Unable to build notification job (invalid timezone or empty signal)' };
    }

    const [job] = jobs;
    const [dispatch] = await this.scheduler.dispatchJobs([job]);

    await prisma.notificationDispatchLog.create({
      data: {
        userId: targetUserId,
        type: NotificationType.COMMUNITY_REPLIES,
        status: dispatch?.delivered ? NotificationDeliveryStatus.SENT : NotificationDeliveryStatus.FAILED,
        channel: 'IN_APP',
        scheduledAtUtc: new Date(job.scheduledAtUtc),
        dispatchedAtUtc: dispatch?.dispatchedAtUtc ? new Date(dispatch.dispatchedAtUtc) : new Date(),
        dedupeKey: `${job.jobId}:${actorUserId}:${Date.now()}`,
        payload: {
          actorUserId,
          replyCount: Math.max(1, Math.floor(event.replyCount ?? 1)),
          occurredAtUtc: event.occurredAtUtc ?? null
        },
        reason: dispatch?.delivered ? null : dispatch?.message ?? 'Failed to dispatch reply notification'
      }
    });

    return {
      notified: Boolean(dispatch?.delivered),
      job,
      dispatch
    };
  }
}

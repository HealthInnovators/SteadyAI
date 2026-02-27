import {
  ConsoleNotificationDispatcher,
  NotificationSchedulerService,
  type NotificationDispatchResult,
  type NotificationJob
} from './notification-scheduler.service';

export interface ReplyCreatedEvent {
  actorUserId: string;
  targetUserId: string;
  targetTimezone?: string;
  targetOptIn: boolean;
  replyCount?: number;
  occurredAtUtc?: string;
}

export interface ReplyNotificationHandleResult {
  notified: boolean;
  reason?: string;
  job?: NotificationJob;
  dispatch?: NotificationDispatchResult;
}

const COOLDOWN_MS = 30 * 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

export class ReplyNotificationListenerService {
  private readonly scheduler: NotificationSchedulerService;
  private readonly lastSentAtByTarget = new Map<string, number>();
  private readonly sendHistoryByTarget = new Map<string, number[]>();

  constructor(scheduler?: NotificationSchedulerService) {
    this.scheduler = scheduler ?? new NotificationSchedulerService(new ConsoleNotificationDispatcher());
  }

  async onReplyCreated(event: ReplyCreatedEvent): Promise<ReplyNotificationHandleResult> {
    const actorUserId = event.actorUserId.trim();
    const targetUserId = event.targetUserId.trim();

    if (!actorUserId || !targetUserId) {
      return { notified: false, reason: 'actorUserId and targetUserId are required' };
    }

    if (actorUserId === targetUserId) {
      return { notified: false, reason: 'Self-replies do not trigger notifications' };
    }

    if (!event.targetOptIn) {
      return { notified: false, reason: 'Target user is not opted in for reply notifications' };
    }

    const now = Date.now();
    const lastSent = this.lastSentAtByTarget.get(targetUserId);
    if (lastSent && now - lastSent < COOLDOWN_MS) {
      return { notified: false, reason: 'Cooldown active to prevent spam' };
    }

    const history = (this.sendHistoryByTarget.get(targetUserId) ?? []).filter((ts) => now - ts < WINDOW_MS);
    if (history.length >= MAX_PER_WINDOW) {
      this.sendHistoryByTarget.set(targetUserId, history);
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
      { [targetUserId]: event.targetTimezone?.trim() || 'UTC' }
    );

    if (jobs.length === 0) {
      return { notified: false, reason: 'Unable to build notification job (invalid timezone or empty signal)' };
    }

    const [job] = jobs;
    const [dispatch] = await this.scheduler.dispatchJobs([job]);

    this.lastSentAtByTarget.set(targetUserId, now);
    this.sendHistoryByTarget.set(targetUserId, [...history, now]);

    return {
      notified: true,
      job,
      dispatch
    };
  }
}


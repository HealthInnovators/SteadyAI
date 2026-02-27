export type NotificationType = 'DAILY_CHECK_IN_REMINDER' | 'WEEKLY_REFLECTION' | 'COMMUNITY_REPLIES';

export interface NotificationOptInSettings {
  dailyCheckInReminder: boolean;
  weeklyReflection: boolean;
  communityReplies: boolean;
}

export interface NotificationSchedulePreferences {
  timezone: string;
  dailyReminderHourLocal: number; // 0-23
  weeklyReflectionDayLocal: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday
  weeklyReflectionHourLocal: number; // 0-23
}

export interface UserNotificationProfile {
  userId: string;
  optIn: NotificationOptInSettings;
  schedule: NotificationSchedulePreferences;
}

export interface NotificationJob {
  jobId: string;
  userId: string;
  type: NotificationType;
  scheduledAtUtc: string;
  timezone: string;
  payload: Record<string, unknown>;
}

export interface NotificationDispatchResult {
  jobId: string;
  userId: string;
  type: NotificationType;
  dispatchedAtUtc: string;
  delivered: boolean;
  message: string;
}

export interface NotificationDispatcher {
  dispatch(job: NotificationJob): Promise<NotificationDispatchResult>;
}

export interface CommunityReplySignal {
  userId: string;
  replyCount: number;
  latestReplyAtUtc?: string;
}

function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function assertHour(hour: number, fieldName: string): void {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new Error(`${fieldName} must be an integer between 0 and 23`);
  }
}

function makeJobId(userId: string, type: NotificationType, atIso: string): string {
  const compact = atIso.replace(/[^0-9]/g, '').slice(0, 14);
  return `${type}:${userId}:${compact}`;
}

function getTimeZoneDateParts(date: Date, timezone: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short'
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '';

  const weekdayText = get('weekday').toLowerCase();
  const weekdayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6
  };

  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
    weekday: weekdayMap[weekdayText.slice(0, 3)] ?? 0
  };
}

function getTimezoneOffsetMinutes(utcDate: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(utcDate);
  const map = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));

  const localAsUtcMs = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  );

  return Math.round((localAsUtcMs - utcDate.getTime()) / 60000);
}

function localTimeToUtcIso(year: number, month: number, day: number, hour: number, minute: number, timezone: string): string {
  const roughUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const offsetMins = getTimezoneOffsetMinutes(roughUtc, timezone);
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, 0) - offsetMins * 60000;
  return new Date(utcMs).toISOString();
}

function addDaysUtc(date: Date, days: number): Date {
  const clone = new Date(date);
  clone.setUTCDate(clone.getUTCDate() + days);
  return clone;
}

function nextDailyUtc(nowUtc: Date, timezone: string, hourLocal: number): string {
  const localNow = getTimeZoneDateParts(nowUtc, timezone);

  let targetYear = localNow.year;
  let targetMonth = localNow.month;
  let targetDay = localNow.day;

  if (localNow.hour >= hourLocal) {
    const tomorrowUtc = addDaysUtc(nowUtc, 1);
    const tomorrowLocal = getTimeZoneDateParts(tomorrowUtc, timezone);
    targetYear = tomorrowLocal.year;
    targetMonth = tomorrowLocal.month;
    targetDay = tomorrowLocal.day;
  }

  return localTimeToUtcIso(targetYear, targetMonth, targetDay, hourLocal, 0, timezone);
}

function nextWeeklyUtc(nowUtc: Date, timezone: string, weekdayLocal: number, hourLocal: number): string {
  const localNow = getTimeZoneDateParts(nowUtc, timezone);

  let dayDelta = weekdayLocal - localNow.weekday;
  if (dayDelta < 0) {
    dayDelta += 7;
  }

  if (dayDelta === 0 && localNow.hour >= hourLocal) {
    dayDelta = 7;
  }

  const targetUtc = addDaysUtc(nowUtc, dayDelta);
  const targetLocal = getTimeZoneDateParts(targetUtc, timezone);
  return localTimeToUtcIso(targetLocal.year, targetLocal.month, targetLocal.day, hourLocal, 0, timezone);
}

function buildSupportiveMessage(job: NotificationJob): string {
  if (job.type === 'DAILY_CHECK_IN_REMINDER') {
    return 'Small progress counts. When you are ready, take a minute for today\'s check-in.';
  }

  if (job.type === 'WEEKLY_REFLECTION') {
    return 'Your weekly reflection is ready. Use it as a light guide for your next steps.';
  }

  return 'You have new community replies. Check in when it fits your schedule.';
}

export class ConsoleNotificationDispatcher implements NotificationDispatcher {
  async dispatch(job: NotificationJob): Promise<NotificationDispatchResult> {
    const message = buildSupportiveMessage(job);

    return {
      jobId: job.jobId,
      userId: job.userId,
      type: job.type,
      dispatchedAtUtc: new Date().toISOString(),
      delivered: true,
      message
    };
  }
}

export class NotificationSchedulerService {
  constructor(private readonly dispatcher: NotificationDispatcher = new ConsoleNotificationDispatcher()) {}

  buildScheduledJobs(profile: UserNotificationProfile, nowUtc: Date = new Date()): NotificationJob[] {
    if (!isValidTimezone(profile.schedule.timezone)) {
      throw new Error('Invalid timezone');
    }

    assertHour(profile.schedule.dailyReminderHourLocal, 'dailyReminderHourLocal');
    assertHour(profile.schedule.weeklyReflectionHourLocal, 'weeklyReflectionHourLocal');

    const jobs: NotificationJob[] = [];

    if (profile.optIn.dailyCheckInReminder) {
      const at = nextDailyUtc(nowUtc, profile.schedule.timezone, profile.schedule.dailyReminderHourLocal);
      jobs.push({
        jobId: makeJobId(profile.userId, 'DAILY_CHECK_IN_REMINDER', at),
        userId: profile.userId,
        type: 'DAILY_CHECK_IN_REMINDER',
        scheduledAtUtc: at,
        timezone: profile.schedule.timezone,
        payload: { kind: 'daily-check-in', supportiveTone: true }
      });
    }

    if (profile.optIn.weeklyReflection) {
      const at = nextWeeklyUtc(
        nowUtc,
        profile.schedule.timezone,
        profile.schedule.weeklyReflectionDayLocal,
        profile.schedule.weeklyReflectionHourLocal
      );
      jobs.push({
        jobId: makeJobId(profile.userId, 'WEEKLY_REFLECTION', at),
        userId: profile.userId,
        type: 'WEEKLY_REFLECTION',
        scheduledAtUtc: at,
        timezone: profile.schedule.timezone,
        payload: { kind: 'weekly-reflection', supportiveTone: true }
      });
    }

    return jobs.sort((a, b) => a.scheduledAtUtc.localeCompare(b.scheduledAtUtc));
  }

  buildCommunityReplyJobs(signals: CommunityReplySignal[], timezoneByUserId: Record<string, string>): NotificationJob[] {
    const now = new Date();
    const jobs: NotificationJob[] = [];

    for (const signal of signals) {
      if (signal.replyCount <= 0) {
        continue;
      }

      const timezone = timezoneByUserId[signal.userId] ?? 'UTC';
      if (!isValidTimezone(timezone)) {
        continue;
      }

      const scheduledAtUtc = new Date(now.getTime() + 2 * 60 * 1000).toISOString();
      jobs.push({
        jobId: makeJobId(signal.userId, 'COMMUNITY_REPLIES', scheduledAtUtc),
        userId: signal.userId,
        type: 'COMMUNITY_REPLIES',
        scheduledAtUtc,
        timezone,
        payload: {
          kind: 'community-replies',
          replyCount: signal.replyCount,
          latestReplyAtUtc: signal.latestReplyAtUtc ?? null,
          supportiveTone: true
        }
      });
    }

    return jobs;
  }

  async dispatchJobs(jobs: NotificationJob[]): Promise<NotificationDispatchResult[]> {
    const ordered = jobs.slice().sort((a, b) => a.scheduledAtUtc.localeCompare(b.scheduledAtUtc));
    const results: NotificationDispatchResult[] = [];

    for (const job of ordered) {
      const result = await this.dispatcher.dispatch(job);
      results.push(result);
    }

    return results;
  }
}

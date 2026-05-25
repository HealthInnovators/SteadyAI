import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import type { ApiClient } from '../api';

const DAILY_CHECK_IN_NOTIFICATION_ID_KEY = 'steadyai.notifications.daily-check-in-id';
const DAILY_CHECK_IN_ENABLED_KEY = 'steadyai.notifications.daily-check-in-enabled';
const DAILY_CHECK_IN_HOUR_KEY = 'steadyai.notifications.daily-check-in-hour';
const REMINDER_CHANNEL_ID = 'steadyai-reminders';
const DEFAULT_REMINDER_HOUR = 20;

export type NotificationPermissionState = 'granted' | 'denied' | 'undetermined';

export type DailyReminderSettings = {
  enabled: boolean;
  hour: number;
};

export function configureNotificationPresentation(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true
    })
  });
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  const permissions = await Notifications.getPermissionsAsync();
  return normalizePermissionState(permissions as unknown as PermissionLike);
}

export async function requestNotificationPermissions(): Promise<NotificationPermissionState> {
  await ensureAndroidReminderChannel();
  const existing = await Notifications.getPermissionsAsync();
  if (normalizePermissionState(existing as unknown as PermissionLike) === 'granted') {
    return 'granted';
  }

  const requested = await Notifications.requestPermissionsAsync();
  return normalizePermissionState(requested as unknown as PermissionLike);
}

export async function getStoredDailyReminderSettings(): Promise<DailyReminderSettings> {
  const [enabledValue, hourValue] = await Promise.all([
    SecureStore.getItemAsync(DAILY_CHECK_IN_ENABLED_KEY),
    SecureStore.getItemAsync(DAILY_CHECK_IN_HOUR_KEY)
  ]);
  const parsedHour = Number(hourValue);

  return {
    enabled: enabledValue === 'true',
    hour: Number.isInteger(parsedHour) && parsedHour >= 0 && parsedHour <= 23 ? parsedHour : DEFAULT_REMINDER_HOUR
  };
}

export async function scheduleDailyCheckInLocalReminder(hour: number): Promise<string> {
  await ensureAndroidReminderChannel();
  await cancelDailyCheckInLocalReminder();

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SteadyAI check-in',
      body: 'Take one minute to log today, reflect, or ask for your next step.',
      data: {
        route: '/(tabs)',
        kind: 'daily-check-in'
      }
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
      channelId: REMINDER_CHANNEL_ID
    }
  });

  await Promise.all([
    SecureStore.setItemAsync(DAILY_CHECK_IN_NOTIFICATION_ID_KEY, notificationId),
    SecureStore.setItemAsync(DAILY_CHECK_IN_ENABLED_KEY, 'true'),
    SecureStore.setItemAsync(DAILY_CHECK_IN_HOUR_KEY, String(hour))
  ]);

  return notificationId;
}

export async function cancelDailyCheckInLocalReminder(): Promise<void> {
  const notificationId = await SecureStore.getItemAsync(DAILY_CHECK_IN_NOTIFICATION_ID_KEY);
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => undefined);
  }

  await Promise.all([
    SecureStore.deleteItemAsync(DAILY_CHECK_IN_NOTIFICATION_ID_KEY),
    SecureStore.setItemAsync(DAILY_CHECK_IN_ENABLED_KEY, 'false')
  ]);
}

export async function syncDailyCheckInReminderToBackend(params: {
  api: ApiClient;
  userId: string;
  enabled: boolean;
  hour: number;
}): Promise<void> {
  await params.api.scheduleDailyCheckInReminder({
    userId: params.userId,
    optIn: {
      dailyCheckInReminder: params.enabled,
      weeklyReflection: false,
      communityReplies: false
    },
    schedule: {
      timezone: getLocalTimezone(),
      dailyReminderHourLocal: params.hour,
      weeklyReflectionDayLocal: 1,
      weeklyReflectionHourLocal: 18
    }
  });
}

async function ensureAndroidReminderChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'SteadyAI reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#8a4b22'
  });
}

function getLocalTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

type PermissionLike = {
  status?: NotificationPermissionState;
  granted?: boolean;
  canAskAgain?: boolean;
};

function normalizePermissionState(permission: PermissionLike): NotificationPermissionState {
  if (permission.status) {
    return permission.status;
  }
  if (permission.granted) {
    return 'granted';
  }
  return permission.canAskAgain === false ? 'denied' : 'undetermined';
}

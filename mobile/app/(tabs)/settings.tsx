import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { ApiClientError, createApiClient } from '../../src/api';
import { useAuth } from '../../src/auth';
import { env, isSupabaseConfigured } from '../../src/config/env';
import {
  cancelDailyCheckInLocalReminder,
  getNotificationPermissionState,
  getStoredDailyReminderSettings,
  requestNotificationPermissions,
  scheduleDailyCheckInLocalReminder,
  syncDailyCheckInReminderToBackend,
  type NotificationPermissionState
} from '../../src/notifications';
import { colors } from '../../src/theme/colors';

const reminderHourOptions = [7, 9, 12, 18, 20, 21];

export default function SettingsScreen() {
  const { isAuthenticated, isHydrated, token, userEmail, userId } = useAuth();
  const api = useMemo(() => createApiClient({ token: () => token }), [token]);
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>('undetermined');
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(false);
  const [dailyReminderHour, setDailyReminderHour] = useState(20);
  const [isUpdatingReminder, setIsUpdatingReminder] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadNotificationState() {
      const [permission, reminderSettings] = await Promise.all([
        getNotificationPermissionState().catch(() => 'undetermined' as NotificationPermissionState),
        getStoredDailyReminderSettings()
      ]);

      if (!active) {
        return;
      }

      setPermissionState(permission);
      setDailyReminderEnabled(reminderSettings.enabled);
      setDailyReminderHour(reminderSettings.hour);
    }

    void loadNotificationState();
    return () => {
      active = false;
    };
  }, []);

  async function updateDailyReminder(nextEnabled: boolean, nextHour = dailyReminderHour): Promise<void> {
    if (isUpdatingReminder) {
      return;
    }

    setIsUpdatingReminder(true);
    setNotificationError(null);
    setNotificationStatus(null);

    try {
      if (!nextEnabled) {
        await cancelDailyCheckInLocalReminder();
        setDailyReminderEnabled(false);
        setNotificationStatus('Daily check-in reminder turned off on this device.');
        if (isAuthenticated && userId) {
          await syncDailyCheckInReminderToBackend({ api, userId, enabled: false, hour: nextHour }).catch(() => undefined);
        }
        return;
      }

      const permission = await requestNotificationPermissions();
      setPermissionState(permission);
      if (permission !== 'granted') {
        throw new Error('Notification permission was not granted.');
      }

      await scheduleDailyCheckInLocalReminder(nextHour);
      setDailyReminderEnabled(true);
      setDailyReminderHour(nextHour);

      if (isAuthenticated && userId) {
        await syncDailyCheckInReminderToBackend({ api, userId, enabled: true, hour: nextHour });
        setNotificationStatus(`Daily check-in reminder set for ${formatHour(nextHour)} and synced to your account.`);
      } else {
        setNotificationStatus(`Daily check-in reminder set for ${formatHour(nextHour)} on this device.`);
      }
    } catch (error) {
      setNotificationError(formatError(error, 'Could not update notification settings.'));
    } finally {
      setIsUpdatingReminder(false);
    }
  }

  async function updateReminderHour(nextHour: number): Promise<void> {
    setDailyReminderHour(nextHour);
    if (dailyReminderEnabled) {
      await updateDailyReminder(true, nextHour);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Settings</Text>
        <Text style={styles.title}>Mobile configuration</Text>

        <View style={styles.card}>
          <SettingRow label="API base URL" value={env.apiBaseUrl} />
          <SettingRow label="Web base URL" value={env.webBaseUrl} />
          <SettingRow label="Supabase configured" value={isSupabaseConfigured() ? 'Yes' : 'No'} />
          <SettingRow label="Auth hydrated" value={isHydrated ? 'Yes' : 'No'} />
          <SettingRow label="Signed in" value={isAuthenticated ? 'Yes' : 'No'} />
          {userEmail ? <SettingRow label="Email" value={userEmail} /> : null}
          {userId ? <SettingRow label="User ID" value={userId} /> : null}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Check-in reminders</Text>
              <Text style={styles.cardBody}>
                Use Expo notifications to remind you to check in. This is a local scheduled reminder on the phone and syncs
                opt-in settings to your SteadyAI account when signed in.
              </Text>
            </View>
            {isUpdatingReminder ? (
              <ActivityIndicator color={colors.ink} />
            ) : (
              <Switch
                onValueChange={(value) => {
                  void updateDailyReminder(value);
                }}
                thumbColor={dailyReminderEnabled ? colors.ink : colors.white}
                trackColor={{ false: colors.sand, true: '#d9c1a8' }}
                value={dailyReminderEnabled}
              />
            )}
          </View>

          <SettingRow label="Permission" value={permissionState} />
          <SettingRow label="Reminder time" value={formatHour(dailyReminderHour)} />

          <View style={styles.hourGrid}>
            {reminderHourOptions.map((hour) => (
              <Pressable
                disabled={isUpdatingReminder}
                key={hour}
                onPress={() => {
                  void updateReminderHour(hour);
                }}
                style={[styles.hourChip, dailyReminderHour === hour ? styles.hourChipSelected : null]}
              >
                <Text style={[styles.hourChipText, dailyReminderHour === hour ? styles.hourChipTextSelected : null]}>
                  {formatHour(hour)}
                </Text>
              </Pressable>
            ))}
          </View>

          {!isAuthenticated ? (
            <Text style={styles.mutedText}>Sign in to sync reminder preferences to your SteadyAI account.</Text>
          ) : null}
          {notificationStatus ? <Text style={styles.statusText}>{notificationStatus}</Text> : null}
          {notificationError ? <Text style={styles.errorText}>{notificationError}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function formatHour(hour: number): string {
  const normalized = ((hour % 24) + 24) % 24;
  const suffix = normalized >= 12 ? 'PM' : 'AM';
  const displayHour = normalized % 12 || 12;
  return `${displayHour}:00 ${suffix}`;
}

function formatError(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.linen
  },
  content: {
    flexGrow: 1,
    gap: 18,
    padding: 20,
    paddingTop: 36,
    paddingBottom: 40
  },
  eyebrow: {
    color: colors.copper,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1
  },
  card: {
    gap: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    padding: 20
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14
  },
  cardHeaderText: {
    flex: 1
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800'
  },
  cardBody: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  row: {
    gap: 6
  },
  label: {
    color: colors.copper,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  value: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700'
  },
  hourGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  hourChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    paddingVertical: 9
  },
  hourChipSelected: {
    borderColor: colors.ink,
    backgroundColor: colors.ink
  },
  hourChipText: {
    color: colors.coffee,
    fontSize: 13,
    fontWeight: '800'
  },
  hourChipTextSelected: {
    color: colors.white
  },
  mutedText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  },
  statusText: {
    color: colors.copper,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20
  },
  errorText: {
    color: '#b42318',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20
  }
});

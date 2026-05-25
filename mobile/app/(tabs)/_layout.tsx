import { Tabs, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ApiClientError, createApiClient } from '../../src/api';
import { useAuth } from '../../src/auth';
import { TabIcon } from '../../src/components/TabIcon';
import { colors } from '../../src/theme/colors';

export default function TabsLayout() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, token } = useAuth();
  const api = useMemo(() => createApiClient({ token: () => token }), [token]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated) {
      return;
    }

    let active = true;
    async function enforceOnboarding() {
      try {
        const context = await api.getPlatformContext();
        if (active && !context.userIdentity.onboardingCompleted) {
          router.replace('/onboarding');
        }
      } catch (error) {
        if (active && error instanceof ApiClientError && error.status === 404) {
          router.replace('/onboarding');
        }
      }
    }

    void enforceOnboarding();
    return () => {
      active = false;
    };
  }, [api, isAuthenticated, isHydrated, router]);

  return (
    <Tabs
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          minHeight: 74,
          borderTopColor: colors.sand,
          backgroundColor: colors.paper,
          paddingBottom: 10,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700'
        },
        tabBarIcon: ({ color, focused, size }: { color: string; focused: boolean; size: number }) => (
          <TabIcon color={color} focused={focused} routeName={route.name} size={size} />
        )
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Coach'
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: 'Workouts'
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrition'
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports'
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community'
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings'
        }}
      />
    </Tabs>
  );
}

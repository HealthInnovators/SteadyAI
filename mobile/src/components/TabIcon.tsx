import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const iconByRoute: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  index: { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  workouts: { active: 'barbell', inactive: 'barbell-outline' },
  nutrition: { active: 'restaurant', inactive: 'restaurant-outline' },
  reports: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  community: { active: 'people', inactive: 'people-outline' },
  settings: { active: 'settings', inactive: 'settings-outline' }
};

export function TabIcon({ routeName, color, focused, size }: { routeName: string; color: string; focused: boolean; size: number }) {
  const icon = iconByRoute[routeName] ?? iconByRoute.index;
  return <Ionicons color={color} name={focused ? icon.active : icon.inactive} size={size} />;
}

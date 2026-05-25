import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/auth';
import { configureNotificationPresentation } from '../src/notifications';
import { colors } from '../src/theme/colors';

configureNotificationPresentation();

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.linen
          }
        }}
      />
      <StatusBar style="dark" />
    </AuthProvider>
  );
}

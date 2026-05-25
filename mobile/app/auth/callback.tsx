import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { completeAuthRedirect } from '../../src/auth';
import { resolvePostAuthRoute } from '../../src/auth/routing';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors } from '../../src/theme/colors';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function finishAuth() {
      try {
        const url = await Linking.getInitialURL();
        if (!url) {
          throw new Error('No authentication callback URL was found.');
        }

        const session = await completeAuthRedirect(url);
        if (active) {
          router.replace(await resolvePostAuthRoute(session?.access_token));
        }
      } catch (callbackError) {
        if (active) {
          setError(callbackError instanceof Error ? callbackError.message : 'Authentication callback failed.');
        }
      }
    }

    void finishAuth();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        {error ? null : <ActivityIndicator color={colors.ink} size="large" />}
        <Text style={styles.title}>{error ? 'Sign-in needs attention' : 'Finishing sign-in'}</Text>
        <Text style={styles.body}>{error ?? 'SteadyAI is restoring your mobile session.'}</Text>
        {error ? (
          <PrimaryButton onPress={() => router.replace('/sign-in')} variant="secondary">
            Return to Sign In
          </PrimaryButton>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.linen,
    padding: 20
  },
  card: {
    width: '100%',
    gap: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    padding: 24
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center'
  },
  body: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  }
});

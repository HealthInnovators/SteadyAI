import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { useAuth } from '../src/auth';
import { resolvePostAuthRoute } from '../src/auth/routing';
import { colors } from '../src/theme/colors';

export default function SignInScreen() {
  const router = useRouter();
  const {
    authError,
    clearAuthError,
    isAppleAuthConfigured,
    isSigningInWithApple,
    isSigningInWithGoogle,
    isSigningInWithPassword,
    isSigningUpWithPassword,
    isSupabaseAuthConfigured,
    signInWithApple,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword
  } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const isBusy = isSigningInWithPassword || isSigningUpWithPassword || isSigningInWithGoogle || isSigningInWithApple;

  async function submit() {
    clearAuthError();
    setNotice(null);

    if (mode === 'sign-in') {
      const result = await signInWithPassword(email, password);
      router.replace(await resolvePostAuthRoute(result.token));
      return;
    }

    const result = await signUpWithPassword(email, password);
    if (result.needsEmailConfirmation) {
      setNotice('Check your email to confirm your account, then return to the app.');
      return;
    }
    router.replace(await resolvePostAuthRoute(result.token));
  }

  async function runOAuth(provider: 'google' | 'apple') {
    clearAuthError();
    setNotice(null);
    if (provider === 'google') {
      const result = await signInWithGoogle();
      router.replace(await resolvePostAuthRoute(result.token));
    } else {
      const result = await signInWithApple();
      router.replace(await resolvePostAuthRoute(result.token));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View>
            <Text style={styles.eyebrow}>SteadyAI account</Text>
            <Text style={styles.title}>{mode === 'sign-in' ? 'Welcome back.' : 'Create your account.'}</Text>
            <Text style={styles.subtitle}>
              Sign in to save your AI coach conversations, workout logs, nutrition entries, and progress reports.
            </Text>
          </View>

          {!isSupabaseAuthConfigured ? (
            <View style={styles.warning}>
              <Text style={styles.warningTitle}>Auth is not configured</Text>
              <Text style={styles.warningBody}>
                Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `mobile/.env`.
              </Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              editable={!isBusy}
              inputMode="email"
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#9a897a"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
            />
            <TextInput
              autoCapitalize="none"
              editable={!isBusy}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#9a897a"
              secureTextEntry
              style={styles.input}
              textContentType={mode === 'sign-in' ? 'password' : 'newPassword'}
              value={password}
            />

            {authError ? <Text style={styles.error}>{authError}</Text> : null}
            {notice ? <Text style={styles.notice}>{notice}</Text> : null}

            <PrimaryButton disabled={isBusy || !email.trim() || !password} onPress={() => void submit()}>
              {mode === 'sign-in'
                ? isSigningInWithPassword
                  ? 'Signing in...'
                  : 'Sign in'
                : isSigningUpWithPassword
                  ? 'Creating account...'
                  : 'Create account'}
            </PrimaryButton>

            <PrimaryButton disabled={isBusy} onPress={() => void runOAuth('google')} variant="secondary">
              {isSigningInWithGoogle ? 'Opening Google...' : 'Continue with Google'}
            </PrimaryButton>

            {isAppleAuthConfigured ? (
              <PrimaryButton disabled={isBusy} onPress={() => void runOAuth('apple')} variant="secondary">
                {isSigningInWithApple ? 'Opening Apple...' : 'Continue with Apple'}
              </PrimaryButton>
            ) : null}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {mode === 'sign-in' ? 'Need an account?' : 'Already have an account?'}
            </Text>
            <PrimaryButton
              disabled={isBusy}
              onPress={() => {
                clearAuthError();
                setNotice(null);
                setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              }}
              variant="secondary"
            >
              {mode === 'sign-in' ? 'Create one' : 'Sign in instead'}
            </PrimaryButton>
            <Link href="/(tabs)" asChild>
              <PrimaryButton variant="secondary">Back to Coach</PrimaryButton>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.linen
  },
  keyboard: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    gap: 22,
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
    marginTop: 12,
    color: colors.ink,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -1.2
  },
  subtitle: {
    marginTop: 12,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24
  },
  warning: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f0b36a',
    backgroundColor: '#fff7ed',
    padding: 16
  },
  warningTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800'
  },
  warningBody: {
    marginTop: 6,
    color: colors.coffee,
    fontSize: 14,
    lineHeight: 20
  },
  formCard: {
    gap: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.paper,
    padding: 18
  },
  input: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.sand,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: 16
  },
  error: {
    color: '#b42318',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20
  },
  notice: {
    color: colors.copper,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20
  },
  footer: {
    gap: 12
  },
  footerText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center'
  }
});

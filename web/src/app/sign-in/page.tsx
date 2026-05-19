'use client';

import { useAuth } from '@/auth';
import { resolvePostAuthRedirect, sanitizeAuthRedirect } from '@/auth/routing';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';

type AuthMode = 'sign-in' | 'sign-up';

const benefits = [
  'Personalized coaching based on your goals and preferences.',
  'Saved workout, nutrition, and progress history.',
  'A clean handoff into onboarding or your AI coach after login.'
];

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    token,
    isHydrated,
    isAuthenticated,
    isGoogleAuthConfigured,
    isAppleAuthConfigured,
    isPasswordAuthConfigured,
    isSigningInWithGoogle,
    isSigningInWithApple,
    isSigningInWithPassword,
    isSigningUpWithPassword,
    signInWithGoogle,
    signInWithApple,
    signInWithPassword,
    signUpWithPassword
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const next = useMemo(() => sanitizeAuthRedirect(searchParams.get('next') || '/onboarding'), [searchParams]);
  const isBusy = isSigningInWithPassword || isSigningUpWithPassword || isSigningInWithGoogle || isSigningInWithApple;

  useEffect(() => {
    let active = true;

    async function routeAuthenticatedUser() {
      if (!isHydrated || !isAuthenticated) {
        return;
      }

      const target = token ? await resolvePostAuthRedirect(token, next) : next;
      if (active) {
        router.replace(target);
      }
    }

    void routeAuthenticatedUser();

    return () => {
      active = false;
    };
  }, [isAuthenticated, isHydrated, next, router, token]);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    try {
      if (mode === 'sign-up') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        const result = await signUpWithPassword(email, password, { redirectTo: next });
        if (result.needsEmailConfirmation) {
          setNotice('Check your email to confirm your account. After confirmation, return here to sign in.');
        }
        return;
      }

      await signInWithPassword(email, password, { redirectTo: next });
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to continue. Please try again.');
    }
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    setError(null);
    setNotice(null);

    try {
      if (provider === 'google') {
        await signInWithGoogle({ redirectTo: next });
        return;
      }

      await signInWithApple({ redirectTo: next });
    } catch (oauthError) {
      setError(oauthError instanceof Error ? oauthError.message : `Unable to continue with ${provider}. Please try again.`);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,237,213,0.95),_rgba(246,236,226,0.96)_36%,_#f4efe8_86%)] px-4 pb-[calc(1rem+var(--safe-bottom))] pt-[calc(1rem+var(--safe-top))] text-[#1d140d] dark:bg-[radial-gradient(circle_at_top_left,_rgba(74,55,43,0.82),_rgba(35,25,20,0.96)_42%,_#15100c_86%)] dark:text-[#fff7ed] sm:px-6">
      <div className="mx-auto grid min-h-[calc(100svh-var(--safe-top)-var(--safe-bottom)-2rem)] w-full max-w-5xl items-center gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="order-2 rounded-[32px] border border-white/80 bg-[#fffaf5]/78 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.1)] backdrop-blur dark:border-[#4a372b] dark:bg-[#231914]/82 dark:shadow-[0_18px_70px_rgba(0,0,0,0.3)] sm:p-7 lg:order-1">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22] dark:text-[#f3c99f]">Why sign in?</p>
          <h1 className="mt-4 text-4xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-5xl">
            Your health plan should remember you.
          </h1>
          <p className="mt-4 text-base leading-7 text-[#5f5145] dark:text-[#d6c2ae]">
            Create an account to save your preferences, complete onboarding, and open your personalized AI coach.
          </p>
          <div className="mt-5 grid gap-3">
            {benefits.map((benefit, index) => (
              <div key={benefit} className="flex items-start gap-3 rounded-[22px] border border-white/80 bg-white/70 p-4 dark:border-[#4a372b] dark:bg-[#15100c]/62">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1d140d] text-xs font-bold text-white dark:bg-[#f3c99f] dark:text-[#1d140d]">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-[#4e4035] dark:text-[#d6c2ae]">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="order-1 rounded-[34px] border border-[#e8d7c6] bg-[#1d140d] p-5 text-white shadow-[0_30px_120px_rgba(29,20,13,0.24)] dark:border-[#4a372b] dark:bg-[#0f0b08] sm:p-7 lg:order-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f3c99f]">Account access</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">Welcome to SteadyAI</h2>
            </div>
            <Link href="/" className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-[#f3e7da]">
              Home
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 rounded-full border border-[#5e4a3b] bg-[#2a1e15] p-1">
            {(['sign-in', 'sign-up'] as const).map((nextMode) => (
              <button
                key={nextMode}
                type="button"
                onClick={() => {
                  setMode(nextMode);
                  setError(null);
                  setNotice(null);
                }}
                className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === nextMode ? 'bg-[#f4d4b0] text-[#1d140d]' : 'text-[#d8c0ad] hover:bg-white/5'
                }`}
              >
                {nextMode === 'sign-in' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {isPasswordAuthConfigured ? (
            <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit}>
              <label className="block text-sm font-medium">
                <span className="mb-2 block text-[#d8c0ad]">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-14 w-full rounded-[22px] border border-[#5e4a3b] bg-[#2a1e15] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#9e8a7b] focus:border-[#f3c99f] focus:ring-4 focus:ring-[#f3c99f]/12"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-sm font-medium">
                <span className="mb-2 block text-[#d8c0ad]">Password</span>
                <input
                  type="password"
                  autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
                  required
                  minLength={mode === 'sign-up' ? 8 : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-14 w-full rounded-[22px] border border-[#5e4a3b] bg-[#2a1e15] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#9e8a7b] focus:border-[#f3c99f] focus:ring-4 focus:ring-[#f3c99f]/12"
                  placeholder={mode === 'sign-up' ? 'At least 8 characters' : 'Enter password'}
                />
              </label>
              {mode === 'sign-up' ? (
                <label className="block text-sm font-medium">
                  <span className="mb-2 block text-[#d8c0ad]">Confirm password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="min-h-14 w-full rounded-[22px] border border-[#5e4a3b] bg-[#2a1e15] px-4 py-3 text-base text-white outline-none transition placeholder:text-[#9e8a7b] focus:border-[#f3c99f] focus:ring-4 focus:ring-[#f3c99f]/12"
                    placeholder="Re-enter password"
                  />
                </label>
              ) : null}

              {error ? (
                <p className="rounded-[18px] border border-[#ffb4ab]/30 bg-[#3b1714] px-4 py-3 text-sm leading-6 text-[#ffdad6]">
                  {error}
                </p>
              ) : null}
              {notice ? (
                <p className="rounded-[18px] bg-[#f4d4b0] px-4 py-3 text-sm leading-6 text-[#1d140d]">
                  {notice}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isBusy}
                className="min-h-14 w-full rounded-full bg-[#f4d4b0] px-5 py-4 text-base font-bold text-[#1d140d] shadow-[0_18px_40px_rgba(0,0,0,0.24)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mode === 'sign-up'
                  ? isSigningUpWithPassword
                    ? 'Creating account...'
                    : 'Create account with email'
                  : isSigningInWithPassword
                    ? 'Signing in...'
                    : 'Continue with email'}
              </button>
            </form>
          ) : (
            <p className="mt-5 rounded-[18px] border border-[#ffb4ab]/30 bg-[#3b1714] px-4 py-3 text-sm leading-6 text-[#ffdad6]">
              Email sign-in is not configured yet. Add the Supabase URL and publishable key to enable account access.
            </p>
          )}

          {(isGoogleAuthConfigured || isAppleAuthConfigured) ? (
            <div className="mt-6 border-t border-[#5e4a3b] pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d8c0ad]">Or continue with</p>
              <div className="mt-4 grid gap-3">
                {isGoogleAuthConfigured ? (
                  <button
                    type="button"
                    onClick={() => {
                      void handleOAuth('google');
                    }}
                    disabled={isBusy}
                    className="min-h-14 w-full rounded-full bg-white px-5 py-4 text-base font-bold text-[#1d140d] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSigningInWithGoogle ? 'Connecting Google...' : 'Continue with Google'}
                  </button>
                ) : null}
                {isAppleAuthConfigured ? (
                  <button
                    type="button"
                    onClick={() => {
                      void handleOAuth('apple');
                    }}
                    disabled={isBusy}
                    className="min-h-14 w-full rounded-full border border-white/30 px-5 py-4 text-base font-bold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSigningInWithApple ? 'Connecting Apple...' : 'Continue with Apple'}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7efe6] dark:bg-[#15100c]" />}>
      <SignInPageContent />
    </Suspense>
  );
}

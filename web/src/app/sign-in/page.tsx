'use client';

import { useAuth } from '@/auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useMemo, useState } from 'react';

type AuthMode = 'sign-in' | 'sign-up';

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
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
  const next = useMemo(() => searchParams.get('next') || '/onboarding', [searchParams]);
  const isBusy = isSigningInWithPassword || isSigningUpWithPassword || isSigningInWithGoogle || isSigningInWithApple;

  if (isHydrated && isAuthenticated) {
    router.replace(next);
  }

  async function handlePasswordSignIn(event: FormEvent<HTMLFormElement>) {
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
          setNotice('Check your email to confirm your account, then return here to sign in.');
        }
        return;
      }

      await signInWithPassword(email, password, { redirectTo: next });
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to continue.');
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,240,220,0.95),_rgba(246,236,226,0.88)_38%,_rgba(244,239,232,1)_100%)] px-4 py-10 text-[#1d140d] sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[36px] border border-white/70 bg-white/72 p-8 shadow-[0_30px_120px_rgba(80,48,24,0.1)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7a4b28]">Steady AI Access</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">Sign in or create your SteadyAI account.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#5f5145]">
            Your account unlocks personalized coaching, saved preferences, workout and nutrition logs, weekly reports, and ChatGPT app context.
          </p>
          <div className="mt-8 rounded-[28px] border border-[#ead9ca] bg-[#fffaf5] p-5 text-sm text-[#5f5145]">
            <p className="font-semibold text-[#1d140d]">What you get after login</p>
            <ul className="mt-3 space-y-2">
              <li>Personalized workout and nutrition coaching.</li>
              <li>Saved plans, preferences, and progress history.</li>
              <li>Check-ins and reports that help you decide what to do next.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-[36px] border border-[#e8d7c6] bg-[#1d140d] p-8 text-white shadow-[0_30px_120px_rgba(29,20,13,0.24)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8c0ad]">Account access</p>
          <div className="mt-5 grid grid-cols-2 rounded-full border border-[#5e4a3b] bg-[#2a1e15] p-1">
            {(['sign-in', 'sign-up'] as const).map((nextMode) => (
              <button
                key={nextMode}
                type="button"
                onClick={() => {
                  setMode(nextMode);
                  setError(null);
                  setNotice(null);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === nextMode ? 'bg-[#f4d4b0] text-[#1d140d]' : 'text-[#d8c0ad] hover:bg-white/5'
                }`}
              >
                {nextMode === 'sign-in' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
          {isPasswordAuthConfigured ? (
            <form className="mt-5 space-y-4" onSubmit={handlePasswordSignIn}>
              <label className="block text-sm">
                <span className="mb-2 block text-[#d8c0ad]">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-[#5e4a3b] bg-[#2a1e15] px-4 py-3 text-white outline-none placeholder:text-[#9e8a7b]"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block text-[#d8c0ad]">Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-[#5e4a3b] bg-[#2a1e15] px-4 py-3 text-white outline-none placeholder:text-[#9e8a7b]"
                  placeholder="Enter password"
                />
              </label>
              {mode === 'sign-up' ? (
                <label className="block text-sm">
                  <span className="mb-2 block text-[#d8c0ad]">Confirm password</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-[#5e4a3b] bg-[#2a1e15] px-4 py-3 text-white outline-none placeholder:text-[#9e8a7b]"
                    placeholder="Re-enter password"
                  />
                </label>
              ) : null}
              {error ? <p className="text-sm text-[#ffb4ab]">{error}</p> : null}
              {notice ? <p className="rounded-2xl bg-[#f4d4b0] p-3 text-sm text-[#1d140d]">{notice}</p> : null}
              <button
                type="submit"
                disabled={isBusy}
                className="w-full rounded-full bg-[#f4d4b0] px-5 py-3 text-sm font-semibold text-[#1d140d] disabled:opacity-60"
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
          ) : null}

          {(isGoogleAuthConfigured || isAppleAuthConfigured) ? (
            <div className="mt-6 border-t border-[#5e4a3b] pt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d8c0ad]">Or use a provider</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {isGoogleAuthConfigured ? (
                  <button
                    type="button"
                    onClick={() => {
                      void signInWithGoogle({ redirectTo: next });
                    }}
                    disabled={isBusy}
                    className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[#1d140d] disabled:opacity-60"
                  >
                    {isSigningInWithGoogle ? 'Connecting Google...' : 'Continue with Google'}
                  </button>
                ) : null}
                {isAppleAuthConfigured ? (
                  <button
                    type="button"
                    onClick={() => {
                      void signInWithApple({ redirectTo: next });
                    }}
                    disabled={isBusy}
                    className="rounded-full border border-white/30 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {isSigningInWithApple ? 'Connecting Apple...' : 'Continue with Apple'}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-6 text-sm text-[#d8c0ad]">
            <Link href="/" className="underline underline-offset-4">
              Back to homepage
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7efe6]" />}>
      <SignInPageContent />
    </Suspense>
  );
}

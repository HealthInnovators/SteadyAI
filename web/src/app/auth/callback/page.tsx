'use client';

import { useAuth } from '@/auth';
import { resolvePostAuthRedirect, sanitizeAuthRedirect } from '@/auth/routing';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function AuthCallbackPageContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function resolveGoogleSignIn() {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        if (active) {
          setError('Supabase browser auth is not configured.');
        }
        return;
      }

      try {
        const code = searchParams.get('code');
        let accessToken: string | null = null;

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
          accessToken = data.session?.access_token ?? null;
        }

        if (!accessToken && typeof window !== 'undefined' && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.slice(1));
          accessToken = hashParams.get('access_token');
        }

        if (!accessToken) {
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            throw sessionError;
          }
          accessToken = data.session?.access_token ?? null;
        }

        if (!accessToken) {
          throw new Error('No Supabase session returned from Google sign-in.');
        }

        login(accessToken);

        const next = sanitizeAuthRedirect(searchParams.get('next') || '/onboarding');
        router.replace(await resolvePostAuthRedirect(accessToken, next));
      } catch (callbackError) {
        if (active) {
          setError(callbackError instanceof Error ? callbackError.message : 'Google sign-in failed.');
        }
      }
    }

    void resolveGoogleSignIn();

    return () => {
      active = false;
    };
  }, [login, router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,237,213,0.95),_rgba(246,236,226,0.96)_36%,_#f4efe8_86%)] px-4 pb-[calc(1rem+var(--safe-bottom))] pt-[calc(1rem+var(--safe-top))] text-center dark:bg-[radial-gradient(circle_at_top_left,_rgba(74,55,43,0.82),_rgba(35,25,20,0.96)_42%,_#15100c_86%)]">
      <div className="w-full max-w-md rounded-[32px] border border-white/80 bg-[#fffaf5]/88 p-6 shadow-[0_24px_80px_rgba(80,48,24,0.12)] backdrop-blur dark:border-[#4a372b] dark:bg-[#231914]/88 dark:shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7a4b28] dark:text-[#f3c99f]">Account sign-in</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#1d140d] dark:text-[#fff7ed]">
          {error ? 'Sign-in needs attention' : 'Finishing authentication'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5f5145] dark:text-[#d6c2ae]">
          {error ? error : 'SteadyAI is completing sign-in and restoring your session.'}
        </p>
        {error ? (
          <button
            type="button"
            onClick={() => router.replace('/sign-in')}
            className="mt-5 min-h-12 w-full rounded-full bg-[#1d140d] px-5 py-3 text-sm font-bold text-white dark:bg-[#fff7ed] dark:text-[#1d140d]"
          >
            Return to sign in
          </button>
        ) : null}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f4efe8] px-4 text-center dark:bg-[#15100c]">
          <div className="w-full max-w-md rounded-[32px] border border-white/80 bg-[#fffaf5]/88 p-6 shadow-[0_24px_80px_rgba(80,48,24,0.12)] dark:border-[#4a372b] dark:bg-[#231914]/88">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7a4b28] dark:text-[#f3c99f]">Account sign-in</p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.05em] text-[#1d140d] dark:text-[#fff7ed]">Finishing authentication</h1>
            <p className="mt-3 text-sm leading-6 text-[#5f5145] dark:text-[#d6c2ae]">
              SteadyAI is completing sign-in and restoring your session.
            </p>
          </div>
        </main>
      }
    >
      <AuthCallbackPageContent />
    </Suspense>
  );
}

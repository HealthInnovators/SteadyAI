import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '../config/env';
import { createMobileSupabaseClient } from './supabase';

type OAuthProvider = 'google' | 'apple';

type AuthContextValue = {
  token: string | null;
  userId: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isSupabaseAuthConfigured: boolean;
  isAppleAuthConfigured: boolean;
  isSigningInWithPassword: boolean;
  isSigningUpWithPassword: boolean;
  isSigningInWithGoogle: boolean;
  isSigningInWithApple: boolean;
  authError: string | null;
  signInWithPassword: (email: string, password: string) => Promise<{ token: string | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean; token: string | null }>;
  signInWithGoogle: () => Promise<{ token: string | null }>;
  signInWithApple: () => Promise<{ token: string | null }>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningInWithPassword, setIsSigningInWithPassword] = useState(false);
  const [isSigningUpWithPassword, setIsSigningUpWithPassword] = useState(false);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);
  const [isSigningInWithApple, setIsSigningInWithApple] = useState(false);
  const isSupabaseAuthConfigured = isSupabaseConfigured();
  const isAppleAuthConfigured = isSupabaseAuthConfigured && process.env.EXPO_PUBLIC_ENABLE_APPLE_AUTH === 'true';

  useEffect(() => {
    const supabase = createMobileSupabaseClient();
    if (!supabase) {
      setIsHydrated(true);
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) {
        return;
      }

      if (error) {
        setAuthError(error.message);
      }

      setSession(data.session ?? null);
      setIsHydrated(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsHydrated(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = getRequiredSupabaseClient();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new Error('Email and password are required.');
    }

    setAuthError(null);
    setIsSigningInWithPassword(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });
      if (error) {
        throw error;
      }
      setSession(data.session ?? null);
      return { token: data.session?.access_token ?? null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email sign-in failed.';
      setAuthError(message);
      throw error;
    } finally {
      setIsSigningInWithPassword(false);
    }
  }, []);

  const signUpWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = getRequiredSupabaseClient();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new Error('Email and password are required.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    setAuthError(null);
    setIsSigningUpWithPassword(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: Linking.createURL('/auth/callback')
        }
      });
      if (error) {
        throw error;
      }
      setSession(data.session ?? null);
      return { needsEmailConfirmation: !data.session, token: data.session?.access_token ?? null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Account creation failed.';
      setAuthError(message);
      throw error;
    } finally {
      setIsSigningUpWithPassword(false);
    }
  }, []);

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    const supabase = getRequiredSupabaseClient();
    const redirectTo = Linking.createURL('/auth/callback');

    setAuthError(null);
    provider === 'google' ? setIsSigningInWithGoogle(true) : setIsSigningInWithApple(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
          queryParams:
            provider === 'google'
              ? {
                  access_type: 'offline',
                  prompt: 'consent'
                }
              : undefined
        }
      });

      if (error) {
        throw error;
      }
      if (!data.url) {
        throw new Error('No OAuth URL returned.');
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success' || !('url' in result)) {
        return { token: null };
      }

      const completedSession = await completeAuthRedirect(result.url);
      return { token: completedSession?.access_token ?? null };
    } catch (error) {
      const message = error instanceof Error ? error.message : `${provider} sign-in failed.`;
      setAuthError(message);
      throw error;
    } finally {
      provider === 'google' ? setIsSigningInWithGoogle(false) : setIsSigningInWithApple(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const supabase = createMobileSupabaseClient();
    setAuthError(null);
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthError(error.message);
      }
    }
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: session?.access_token ?? null,
      userId: session?.user.id ?? null,
      userEmail: session?.user.email ?? null,
      isAuthenticated: Boolean(session?.access_token),
      isHydrated,
      isSupabaseAuthConfigured,
      isAppleAuthConfigured,
      isSigningInWithPassword,
      isSigningUpWithPassword,
      isSigningInWithGoogle,
      isSigningInWithApple,
      authError,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle: () => signInWithOAuth('google'),
      signInWithApple: () => signInWithOAuth('apple'),
      logout,
      clearAuthError: () => setAuthError(null)
    }),
    [
      authError,
      isAppleAuthConfigured,
      isHydrated,
      isSigningInWithApple,
      isSigningInWithGoogle,
      isSigningInWithPassword,
      isSigningUpWithPassword,
      isSupabaseAuthConfigured,
      logout,
      session,
      signInWithOAuth,
      signInWithPassword,
      signUpWithPassword
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }
  return context;
}

export async function completeAuthRedirect(url: string): Promise<Session | null> {
  const supabase = getRequiredSupabaseClient();
  const parsed = new URL(url);
  const code = parsed.searchParams.get('code');

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }
    return data.session ?? null;
  }

  const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash;
  const hashParams = new URLSearchParams(hash);
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    if (error) {
      throw error;
    }
    return data.session ?? null;
  }

  throw new Error('No Supabase OAuth session returned.');
}

function getRequiredSupabaseClient() {
  const supabase = createMobileSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase mobile auth is not configured.');
  }
  return supabase;
}

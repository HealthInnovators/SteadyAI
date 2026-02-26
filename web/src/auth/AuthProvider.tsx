'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

const AUTH_STORAGE_KEY = 'steadyai.jwt';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (jwt: string) => void;
  setToken: (jwt: string | null) => void;
  logout: (options?: { redirectTo?: string }) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      setTokenState(stored && stored.trim() ? stored : null);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY) {
        return;
      }
      const next = event.newValue && event.newValue.trim() ? event.newValue : null;
      setTokenState(next);
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const persistToken = useCallback((jwt: string | null) => {
    if (jwt && jwt.trim()) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, jwt.trim());
      setTokenState(jwt.trim());
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setTokenState(null);
  }, []);

  const login = useCallback(
    (jwt: string) => {
      persistToken(jwt);
    },
    [persistToken]
  );

  const logout = useCallback(
    (options?: { redirectTo?: string }) => {
      persistToken(null);
      const target = options?.redirectTo ?? '/';
      if (pathname !== target) {
        router.replace(target);
      }
    },
    [pathname, persistToken, router]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isHydrated,
      isAuthenticated: Boolean(token),
      login,
      setToken: persistToken,
      logout
    }),
    [isHydrated, login, logout, persistToken, token]
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

export function useRequireAuth(options?: { redirectTo?: string }) {
  const { isHydrated, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated || isAuthenticated) {
      return;
    }

    const redirectBase = options?.redirectTo ?? '/';
    const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
    router.replace(`${redirectBase}${next}`);
  }, [isAuthenticated, isHydrated, options?.redirectTo, pathname, router]);

  return {
    isHydrated,
    isAuthenticated,
    isAuthorized: isHydrated && isAuthenticated
  };
}

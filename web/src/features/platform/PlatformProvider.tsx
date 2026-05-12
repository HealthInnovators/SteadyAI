'use client';

import { useAuth } from '@/auth';
import { createApiClient, type PlatformContext, UserRole } from '@/lib/api';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface IPlatformContext extends PlatformContext {
    isLoading: boolean;
    error: string | null;
}

const PlatformContext = createContext<IPlatformContext | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    const api = useMemo(() => createApiClient(token ?? undefined), [token]);
    const [context, setContext] = useState<PlatformContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      async function fetchContext() {
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const platformContext = await api.getPlatformContext();
            setContext(platformContext);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load platform context.');
        } finally {
            setIsLoading(false);
        }
      }
      fetchContext();
    }, [api, token]);

    const value: IPlatformContext = useMemo(() => ({
        ...(context || {
            userIdentity: { id: '', email: '', displayName: '', onboardingCompleted: false },
            workspace: { id: '', name: '', role: UserRole.MEMBER },
            enabledModules: []
        }),
        isLoading,
        error,
    }), [context, isLoading, error]);

    return (
        <PlatformContext.Provider value={value}>
            {children}
        </PlatformContext.Provider>
    );
}

export function usePlatformContext() {
    const context = useContext(PlatformContext);
    if (context === undefined) {
        throw new Error('usePlatformContext must be used within a PlatformProvider');
    }
    return context;
}

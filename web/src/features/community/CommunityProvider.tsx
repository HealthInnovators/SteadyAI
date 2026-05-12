'use client';

import { useCommunityFeed, type UseCommunityFeedReturn } from './useCommunityFeed';
import { useAuth, useRequireAuth } from '@/auth';
import { createContext, useContext } from 'react';

const CommunityContext = createContext<UseCommunityFeedReturn | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
    const { token } = useAuth();
    const { isAuthorized } = useRequireAuth();
    const communityHook = useCommunityFeed({ token, enabled: isAuthorized });
    
    return (
        <CommunityContext.Provider value={communityHook}>
            {children}
        </CommunityContext.Provider>
    );
}

export function useCommunity() {
    const context = useContext(CommunityContext);
    if (context === undefined) {
        throw new Error('useCommunity must be used within a CommunityProvider');
    }
    return context;
}

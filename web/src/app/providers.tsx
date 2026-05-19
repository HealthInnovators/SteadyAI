'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/auth';
import { PwaLifecycle } from '@/components/PwaLifecycle';
import { ThemeProvider } from '@/features/settings/components/ThemeCard';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PwaLifecycle />
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}

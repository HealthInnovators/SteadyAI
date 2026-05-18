'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/auth';
import { PwaLifecycle } from '@/components/PwaLifecycle';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PwaLifecycle />
      {children}
    </AuthProvider>
  );
}

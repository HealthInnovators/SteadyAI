'use client';

import { useRequireAuth } from '@/auth';
import { PlatformSidebarNav } from '@/components/PlatformSidebarNav';
import { PlatformProvider } from '@/features/platform/PlatformProvider';

export default function PlatformLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isHydrated, isAuthenticated } = useRequireAuth({ redirectTo: '/sign-in' });

  if (!isHydrated || !isAuthenticated) {
    return (
      <main className="flex h-screen items-center justify-center bg-[#f7efe6]">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#1d140d]">Loading your space...</p>
          <p className="text-sm text-[#7a4b28]">Please wait a moment.</p>
        </div>
      </main>
    );
  }

  return (
    <PlatformProvider>
      <div className="flex min-h-screen">
        <PlatformSidebarNav />
        <main className="flex-1 bg-[radial-gradient(circle_at_top,_rgba(255,240,220,0.95),_rgba(246,236,226,0.88)_38%,_rgba(244,239,232,1)_100%)]">
          {children}
        </main>
      </div>
    </PlatformProvider>
  );
}

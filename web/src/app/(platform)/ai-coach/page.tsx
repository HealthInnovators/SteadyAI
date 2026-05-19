'use client';

import { useRequireAuth } from '@/auth';
import dynamic from 'next/dynamic';

const AgentInteractionPanel = dynamic(
  () => import('@/features/ai-coach').then((module) => module.AgentInteractionPanel),
  {
    ssr: false,
    loading: () => (
      <main className="flex min-h-screen items-center justify-center bg-[#f4efe8] px-4 text-center dark:bg-[#15100c]">
        <div className="rounded-[28px] border border-white/80 bg-[#fffaf5]/88 p-6 shadow-[0_18px_70px_rgba(80,48,24,0.1)] dark:border-[#4a372b] dark:bg-[#231914]/88">
          <p className="text-sm font-semibold text-[#1d140d] dark:text-[#fff7ed]">Loading your AI coach...</p>
          <p className="mt-2 text-xs text-[#7a4b28] dark:text-[#f3c99f]">Preparing the conversation workspace.</p>
        </div>
      </main>
    )
  }
);

export default function AiCoachPage() {
  const { isHydrated, isAuthorized } = useRequireAuth();

  if (!isHydrated || !isAuthorized) {
    return <main className="mx-auto max-w-3xl p-6 text-sm text-gray-600">Checking authentication...</main>;
  }

  return <AgentInteractionPanel />;
}

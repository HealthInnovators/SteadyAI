'use client';

import { useRequireAuth } from '@/auth';
import { AgentInteractionPanel } from '@/features/agents';

export default function AgentsPage() {
  const { isHydrated, isAuthorized } = useRequireAuth();

  if (!isHydrated || !isAuthorized) {
    return <main className="mx-auto max-w-3xl p-6 text-sm text-gray-600">Checking authentication...</main>;
  }

  return <AgentInteractionPanel />;
}

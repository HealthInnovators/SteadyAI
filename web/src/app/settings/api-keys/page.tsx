'use client';

import { useRequireAuth } from '@/auth';
import { ApiKeySettingsPanel } from '@/features/apiKeys';

export default function ApiKeysSettingsPage() {
  const { isHydrated, isAuthorized } = useRequireAuth();

  if (!isHydrated || !isAuthorized) {
    return <main className="mx-auto max-w-2xl p-6 text-sm text-gray-600">Checking authentication...</main>;
  }

  return <ApiKeySettingsPanel />;
}

'use client';

import { useAuth, useRequireAuth } from '@/auth';
import { ChallengeCheckInCard } from '@/features/challenges';

export default function CheckInPage() {
  const { token } = useAuth();
  const { isHydrated, isAuthorized } = useRequireAuth();

  if (!isHydrated || !isAuthorized) {
    return <main className="mx-auto max-w-2xl p-6 text-sm text-gray-600">Checking authentication...</main>;
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <ChallengeCheckInCard token={token} />
    </main>
  );
}

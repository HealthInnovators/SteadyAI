'use client';

import type { PlatformContext } from '@/lib/api';

export function ProfileCard({ context }: { context: PlatformContext }) {
  const { userIdentity } = context;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1d140d]">Account Profile</h3>
      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs font-medium uppercase text-[#7a4b28]">Display Name</p>
          <p className="text-base text-[#4e4035]">{userIdentity.displayName || 'Not set'}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-[#7a4b28]">Email</p>
          <p className="text-base text-[#4e4035]">{userIdentity.email}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-[#7a4b28]">Onboarding</p>
          <p className="text-base text-[#4e4035]">{userIdentity.onboardingCompleted ? 'Completed' : 'Not Completed'}</p>
        </div>
      </div>
    </div>
  );
}

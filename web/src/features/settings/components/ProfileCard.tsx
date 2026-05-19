'use client';

import type { PlatformContext } from '@/lib/api';

export function ProfileCard({ context }: { context: PlatformContext }) {
  const { userIdentity } = context;

  return (
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] dark:border-[#4a372b] dark:bg-[#231914]/88 dark:shadow-[0_18px_60px_rgba(0,0,0,0.3)] sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1d140d] text-base font-bold text-white">
          {(userIdentity.displayName || userIdentity.email || 'S').slice(0, 2).toUpperCase()}
        </div>
        <div>
        <h3 className="text-2xl font-bold tracking-[-0.04em] text-[#1d140d] dark:text-[#fff7ed]">Account Profile</h3>
          <p className="text-sm text-[#5f5145] dark:text-[#d6c2ae]">Your SteadyAI identity</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ProfileItem label="Display Name" value={userIdentity.displayName || 'Not set'} />
        <ProfileItem label="Email" value={userIdentity.email || 'Not set'} />
        <ProfileItem label="Onboarding" value={userIdentity.onboardingCompleted ? 'Completed' : 'Not completed'} />
      </div>
    </section>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/80 bg-white/72 p-4 dark:border-[#4a372b] dark:bg-[#15100c]/72">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7a4b28] dark:text-[#f3c99f]">{label}</p>
      <p className="mt-2 break-words text-base font-semibold text-[#4e4035] dark:text-[#fff7ed]">{value}</p>
    </div>
  );
}

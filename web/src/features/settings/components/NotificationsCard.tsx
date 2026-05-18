'use client';

import Link from 'next/link';

export function NotificationsCard() {
  return (
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] sm:p-6">
      <h3 className="text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Notifications</h3>
       <p className="mt-2 text-sm leading-6 text-[#5f5145]">
        Manage when and how you receive notifications from SteadyAI.
      </p>
      <div className="mt-4">
        <Link href="/settings/notifications" className="inline-flex w-full justify-center rounded-full bg-[#1d140d] px-5 py-3 text-sm font-semibold text-white sm:w-auto">
          Configure Notifications
        </Link>
      </div>
    </section>
  );
}

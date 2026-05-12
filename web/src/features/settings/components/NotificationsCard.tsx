'use client';

import Link from 'next/link';

export function NotificationsCard() {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1d140d]">Notifications</h3>
       <p className="mt-1 text-sm text-[#5f5145]">
        Manage when and how you receive notifications from SteadyAI.
      </p>
      <div className="mt-4">
        <Link href="/settings/notifications" className="inline-block rounded-full bg-[#1d140d] px-5 py-3 text-sm font-medium text-white">
          Configure Notifications
        </Link>
      </div>
    </div>
  );
}

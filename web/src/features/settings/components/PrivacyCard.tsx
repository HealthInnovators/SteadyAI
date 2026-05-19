'use client';

function ConsentItem({ label, enabled }: { label: string; enabled: boolean }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-[20px] border border-white/80 bg-white/72 p-4 dark:border-[#4a372b] dark:bg-[#15100c]/72">
            <p className="text-sm font-semibold text-[#4e4035] dark:text-[#fff7ed]">{label}</p>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                {enabled ? 'Enabled' : 'Disabled'}
            </span>
        </div>
    );
}

export function PrivacyCard() {
  // Mock data for now, as we don't have an endpoint for this yet.
  const consents = {
    healthData: true,
    locationContext: false,
    motionSignals: false,
    reminders: true,
  };

  return (
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] dark:border-[#4a372b] dark:bg-[#231914]/88 dark:shadow-[0_18px_60px_rgba(0,0,0,0.3)] sm:p-6">
      <h3 className="text-2xl font-bold tracking-[-0.04em] text-[#1d140d] dark:text-[#fff7ed]">Privacy & Consents</h3>
      <p className="mt-2 text-sm leading-6 text-[#5f5145] dark:text-[#d6c2ae]">
        You are in control of your data. Manage your consent for optional features here.
      </p>
      <div className="mt-4 space-y-3">
        <ConsentItem label="Health Data Sync" enabled={consents.healthData} />
        <ConsentItem label="Location-based Coaching" enabled={consents.locationContext} />
        <ConsentItem label="Motion Data for Workouts" enabled={consents.motionSignals} />
        <ConsentItem label="Notifications & Reminders" enabled={consents.reminders} />
      </div>
    </section>
  );
}

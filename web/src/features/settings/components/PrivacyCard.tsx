'use client';

function ConsentItem({ label, enabled }: { label: string; enabled: boolean }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-white/50 p-3">
            <p className="text-sm text-[#4e4035]">{label}</p>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
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
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1d140d]">Privacy & Consents</h3>
      <p className="mt-1 text-sm text-[#5f5145]">
        You are in control of your data. Manage your consent for optional features here.
      </p>
      <div className="mt-4 space-y-2">
        <ConsentItem label="Health Data Sync" enabled={consents.healthData} />
        <ConsentItem label="Location-based Coaching" enabled={consents.locationContext} />
        <ConsentItem label="Motion Data for Workouts" enabled={consents.motionSignals} />
        <ConsentItem label="Notifications & Reminders" enabled={consents.reminders} />
      </div>
    </div>
  );
}

'use client';

export function ConnectedServicesCard() {
  const serviceStatuses = [
    { name: 'Manual meal and workout logging', status: 'Available', detail: 'Use the coach, nutrition, and workout screens now.' },
    { name: 'Apple Health', status: 'Requires mobile app', detail: 'Needs native HealthKit access in a future iOS app.' },
    { name: 'Android Health Connect', status: 'Requires mobile app', detail: 'Needs native Android access in a future app wrapper.' },
    { name: 'Fitbit / Oura', status: 'Planned', detail: 'OAuth sync can be added after core mobile flows are stable.' }
  ];

  return (
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] sm:p-6">
      <h3 className="text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Connected Services</h3>
      <p className="mt-2 text-sm leading-6 text-[#5f5145]">
        Device and wearable sync is not active yet. These statuses show what is available now and what requires a native mobile app later.
      </p>
      <div className="mt-4 space-y-3">
        {serviceStatuses.map((service) => (
          <div key={service.name} className="rounded-[22px] border border-white/80 bg-white/72 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-[#1d140d]">{service.name}</p>
              <span className="shrink-0 rounded-full bg-[#f3e7da] px-3 py-1 text-xs font-bold text-[#7a4b28]">{service.status}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#5f5145]">{service.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

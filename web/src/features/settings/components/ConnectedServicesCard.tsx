'use client';

export function ConnectedServicesCard() {
  // Empty state for now
  const connectedServices: Array<{ id: string; name: string }> = [];

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1d140d]">Connected Services</h3>
      <div className="mt-4">
        {connectedServices.length === 0 ? (
          <div className="text-center rounded-lg border-2 border-dashed border-[#ead9ca] p-8">
            <p className="text-sm text-[#5f5145]">No services are connected yet.</p>
            <p className="mt-1 text-xs text-[#7a4b28]">Connect services like Google Health to automate your tracking.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Map over connectedServices here */}
          </div>
        )}
      </div>
    </div>
  );
}

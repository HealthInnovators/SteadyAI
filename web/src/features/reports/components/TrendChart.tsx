import type { TrendDataItem } from "@/lib/api";

export function TrendChart({ title, data }: { title: string; data: TrendDataItem[]; }) {
  const maxValue = Math.max(1, ...data.map(item => item.value));

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
      <h4 className="text-lg font-semibold text-[#1d140d]">{title}</h4>
      {data.every(d => d.value === 0) ? (
        <p className="mt-4 text-sm text-[#5f5145]">Not enough data to show a trend yet.</p>
      ) : (
        <div className="mt-4 flex h-40 items-end justify-around gap-2">
          {data.map(item => (
            <div key={item.date} className="flex-1 text-center">
              <div 
                className="mx-auto w-full rounded-t-md bg-[#1d140d]/80 transition-all hover:bg-[#1d140d]"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              />
              <p className="mt-2 text-xs text-[#7a4b28]">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

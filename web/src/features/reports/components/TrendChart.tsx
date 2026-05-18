import type { TrendDataItem } from "@/lib/api";

export function TrendChart({ title, data }: { title: string; data: TrendDataItem[]; }) {
  const maxValue = Math.max(1, ...data.map(item => item.value));
  const activeDays = data.filter((item) => item.value > 0).length;

  return (
    <div className="rounded-[26px] border border-white/80 bg-white/72 p-4 shadow-[0_12px_36px_rgba(80,48,24,0.08)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-[#1d140d] sm:text-lg">{title}</h4>
          <p className="mt-1 text-xs text-[#7a4b28]">{activeDays} active day{activeDays === 1 ? '' : 's'} in this range</p>
        </div>
        <span className="rounded-full bg-[#f3e7da] px-3 py-1 text-xs font-semibold text-[#7a4b28]">{data.length} days</span>
      </div>
      {data.every(d => d.value === 0) ? (
        <p className="mt-4 text-sm text-[#5f5145]">Not enough data to show a trend yet.</p>
      ) : (
        <div className="mt-4 flex h-36 items-end gap-2 overflow-x-auto pb-1 sm:h-40 sm:overflow-visible">
          {data.map(item => (
            <div key={item.date} className="min-w-8 flex-1 text-center">
              <div 
                className="mx-auto w-full rounded-t-xl bg-[#1d140d]/80 transition-all hover:bg-[#1d140d]"
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

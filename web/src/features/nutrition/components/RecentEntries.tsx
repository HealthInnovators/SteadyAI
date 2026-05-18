'use client';
import type { NutritionEntry } from '@/lib/api';

function EntryItem({ item }: { item: NutritionEntry }) {
  const time = new Date(item.consumedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const names = item.items.map(i => i.name).join(', ') || 'Meal entry';

  return (
    <article className="rounded-[26px] border border-white/80 bg-white/78 p-4 shadow-[0_12px_36px_rgba(80,48,24,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold tracking-[-0.03em] text-[#1d140d]">{names}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7a4b28]">{time}</p>
        </div>
        <div className="rounded-[18px] bg-[#1d140d] px-3 py-2 text-right text-white">
          <p className="text-xl font-bold tracking-[-0.04em]">{Math.round(item.totalCalories ?? 0)}</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f1d6b7]">kcal</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MacroPill label="Protein" value={item.totalProteinG} />
        <MacroPill label="Carbs" value={item.totalCarbsG} />
        <MacroPill label="Fat" value={item.totalFatG} />
      </div>
    </article>
  );
}

function MacroPill({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-[18px] bg-[#f3e7da] px-3 py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7a4b28]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[#1d140d]">{Math.round(value ?? 0)}g</p>
    </div>
  );
}

export function RecentEntries({ entries }: { entries: NutritionEntry[] }) {
    if (entries.length === 0) {
        return (
            <div className="rounded-[30px] border-2 border-dashed border-[#d8c4b3] bg-white/60 p-8 text-center">
                <p className="text-base font-semibold text-[#1d140d]">No recent meals logged.</p>
                <p className="mt-2 text-sm text-[#5f5145]">Use quick log to capture your first meal.</p>
            </div>
        );
    }

  return (
    <div className="space-y-3">
        {entries.map(entry => <EntryItem key={entry.id} item={entry} />)}
    </div>
  );
}

'use client';
import type { NutritionEntry } from '@/lib/api';

function EntryItem({ item }: { item: NutritionEntry }) {
  const time = new Date(item.consumedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="rounded-lg border border-white/70 bg-white/50 p-4">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-semibold text-[#1d140d]">
                    {item.items.map(i => i.name).join(', ')}
                </p>
                <p className="text-xs text-[#7a4b28]">{time}</p>
            </div>
            <div className="text-right">
                <p className="text-lg font-bold text-[#1d140d]">{Math.round(item.totalCalories ?? 0)}</p>
                <p className="text-xs text-[#7a4b28]">kcal</p>
            </div>
        </div>
    </div>
  );
}


export function RecentEntries({ entries }: { entries: NutritionEntry[] }) {
    if (entries.length === 0) {
        return (
            <div className="text-center p-8 rounded-lg border-2 border-dashed border-[#ead9ca]">
                <p className="text-sm text-[#5f5145]">No recent meals logged.</p>
            </div>
        );
    }

  return (
    <div className="space-y-4">
        {entries.map(entry => <EntryItem key={entry.id} item={entry} />)}
    </div>
  );
}

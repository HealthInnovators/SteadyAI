'use client';

import type { NutritionEntry } from '@/lib/api';
import { useMemo } from 'react';

function SummaryStat({ label, value, unit }: { label: string; value: number; unit: string; }) {
    return (
      <div className="rounded-lg border border-white/70 bg-white/50 p-4 text-center">
        <p className="text-3xl font-semibold text-[#1d140d]">{Math.round(value)}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#7a4b28]">{label} ({unit})</p>
      </div>
    );
}

export function DailySummary({ entries }: { entries: NutritionEntry[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const todaysEntries = entries.filter(e => e.consumedAt.startsWith(today));

  const totals = useMemo(() => {
    return todaysEntries.reduce(
      (acc, entry) => {
        acc.calories += entry.totalCalories ?? 0;
        acc.protein += entry.totalProteinG ?? 0;
        acc.carbs += entry.totalCarbsG ?? 0;
        acc.fat += entry.totalFatG ?? 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todaysEntries]);

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1d140d]">Today&apos;s Summary</h3>
      {todaysEntries.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <SummaryStat label="Calories" value={totals.calories} unit="kcal" />
          <SummaryStat label="Protein" value={totals.protein} unit="g" />
          <SummaryStat label="Carbs" value={totals.carbs} unit="g" />
          <SummaryStat label="Fat" value={totals.fat} unit="g" />
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#5f5145]">Log your first meal of the day to see a summary here.</p>
      )}
    </div>
  );
}

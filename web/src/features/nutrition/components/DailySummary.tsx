'use client';

import type { NutritionEntry } from '@/lib/api';
import { useMemo } from 'react';

function SummaryStat({ label, value, unit }: { label: string; value: number; unit: string; }) {
    return (
      <div className="min-w-[9.5rem] rounded-[22px] border border-white/80 bg-white/72 p-4 shadow-[0_10px_32px_rgba(80,48,24,0.07)] dark:border-[#4a372b] dark:bg-[#15100c]/72">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a4b28] dark:text-[#f3c99f]">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#1d140d] dark:text-[#fff7ed]">
          {Math.round(value)}
          <span className="ml-1 text-sm font-semibold tracking-normal text-[#5f5145] dark:text-[#d6c2ae]">{unit}</span>
        </p>
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
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] dark:border-[#4a372b] dark:bg-[#231914]/88 dark:shadow-[0_18px_60px_rgba(0,0,0,0.3)] sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22] dark:text-[#f3c99f]">Today</p>
          <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[#1d140d] dark:text-[#fff7ed]">Daily Summary</h3>
        </div>
        <p className="rounded-full bg-[#f3e7da] px-3 py-1 text-xs font-semibold text-[#7a4b28] dark:bg-[#4a372b] dark:text-[#f3c99f]">{todaysEntries.length} meal{todaysEntries.length === 1 ? '' : 's'} logged</p>
      </div>
      {todaysEntries.length > 0 ? (
        <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0">
          <SummaryStat label="Calories" value={totals.calories} unit="kcal" />
          <SummaryStat label="Protein" value={totals.protein} unit="g" />
          <SummaryStat label="Carbs" value={totals.carbs} unit="g" />
          <SummaryStat label="Fat" value={totals.fat} unit="g" />
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[#d8c4b3] bg-white/60 p-5 dark:border-[#7b604d] dark:bg-[#15100c]/62">
          <p className="text-base font-semibold text-[#1d140d] dark:text-[#fff7ed]">No meals logged today.</p>
          <p className="mt-2 text-sm leading-6 text-[#5f5145] dark:text-[#d6c2ae]">Log your first meal to see calories, protein, carbs, and fat here.</p>
        </div>
      )}
    </section>
  );
}

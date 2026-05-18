'use client';

import { useAuth } from '@/auth';
import { createApiClient, type NutritionEntry } from '@/lib/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DailySummary } from '@/features/nutrition/components/DailySummary';
import { MealLogger } from '@/features/nutrition/components/MealLogger';
import { RecentEntries } from '@/features/nutrition/components/RecentEntries';
import Link from 'next/link';

export default function NutritionPage() {
  const { token } = useAuth();
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const recentEntries = await api.getNutritionEntries();
      setEntries(recentEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load nutrition entries.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleMealLogged = (newEntry: NutritionEntry) => {
    setEntries(prev => [newEntry, ...prev]);
  };

  return (
    <div className="min-h-screen px-4 pb-28 pt-4 sm:px-6 md:p-8">
      <header className="mb-5 rounded-[34px] border border-white/80 bg-[#fffaf5]/84 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.1)] sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#8a4b22]">Nutrition expert</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.05em] text-[#1d140d] sm:text-4xl">Nutrition</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5145] sm:text-base">
              Log meals in plain language, review today&apos;s macros, and keep recent meals easy to find on your phone.
            </p>
          </div>
          <Link
            href="/agents"
            className="inline-flex justify-center rounded-full bg-[#1d140d] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(29,20,13,0.2)]"
          >
            Ask for a meal idea
          </Link>
        </div>
      </header>
      
      {error && <div className="mb-4 rounded-[24px] border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <MealLogger onMealLogged={handleMealLogged} />
          <DailySummary entries={entries} />
        </div>
        <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Meal history</p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Recent Entries</h2>
            </div>
            <p className="rounded-full bg-[#f3e7da] px-3 py-1 text-xs font-semibold text-[#7a4b28]">{entries.length} meals</p>
          </div>
          {loading ? (
            <RecentEntriesLoading />
          ) : (
            <RecentEntries entries={entries} />
          )}
        </section>
      </div>
    </div>
  );
}

function RecentEntriesLoading() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div key={item} className="animate-pulse rounded-[24px] border border-white/80 bg-white/60 p-4">
          <div className="h-4 w-2/3 rounded-full bg-[#ead9ca]" />
          <div className="mt-3 h-3 w-24 rounded-full bg-[#f3e7da]" />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[0, 1, 2].map((stat) => (
              <div key={stat} className="h-14 rounded-[18px] bg-[#f3e7da]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

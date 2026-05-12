'use client';

import { useAuth } from '@/auth';
import { createApiClient, type NutritionEntry } from '@/lib/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DailySummary } from '@/features/nutrition/components/DailySummary';
import { MealLogger } from '@/features/nutrition/components/MealLogger';
import { RecentEntries } from '@/features/nutrition/components/RecentEntries';

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
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d140d]">Nutrition</h1>
        <p className="text-base text-[#5f5145]">Log meals, view your daily summary, and see your history.</p>
      </header>
      
      {error && <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
          <MealLogger onMealLogged={handleMealLogged} />
          <DailySummary entries={entries} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-[#1d140d] mb-4">Recent Entries</h2>
          {loading ? (
            <div className="p-8 text-center">Loading entries...</div>
          ) : (
            <RecentEntries entries={entries} />
          )}
        </div>
      </div>
    </div>
  );
}

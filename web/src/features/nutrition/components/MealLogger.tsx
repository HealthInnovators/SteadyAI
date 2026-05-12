'use client';

import { useAuth } from '@/auth';
import { createApiClient, type NutritionEntry } from '@/lib/api';
import { useMemo, useState } from 'react';

export function MealLogger({ onMealLogged }: { onMealLogged: (newEntry: NutritionEntry) => void }) {
    const { token } = useAuth();
    const api = useMemo(() => createApiClient(token ?? undefined), [token]);
    const [nutritionInput, setNutritionInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    async function submitNutritionLog() {
        const trimmed = nutritionInput.trim();
        if (!trimmed) {
          setError('Describe what you ate to log nutrition.');
          return;
        }

        setError(null);
        setMessage(null);
        setIsSaving(true);

        try {
          const response = await api.post<NutritionEntry, { inputType: 'TEXT'; rawText: string; }>('/api/nutrition/ingest', {
            body: {
                inputType: 'TEXT',
                rawText: trimmed,
            }
          });
          
          onMealLogged(response);
          setNutritionInput('');
          setMessage('Meal captured successfully.');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to save nutrition entry. Please try again.');
          setMessage(null);
        } finally {
            setIsSaving(false);
        }
    }

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1d140d]">Log a Meal</h3>
       <p className="mt-1 text-sm text-[#5f5145]">
        Describe what you ate, and our AI will analyze it for you.
      </p>
      <div className="mt-4">
        <textarea
            value={nutritionInput}
            onChange={(event) => setNutritionInput(event.target.value)}
            placeholder="e.g., 'For breakfast, I had a bowl of oatmeal with berries and a coffee.'"
            className="min-h-24 w-full rounded-lg border border-[#dccbbb] bg-white/80 p-3 text-sm outline-none transition focus:border-[#1d140d]"
        />
        <button
            type="button"
            onClick={submitNutritionLog}
            disabled={isSaving}
            className="mt-3 w-full rounded-full bg-[#1d140d] px-5 py-3 text-sm font-medium text-white disabled:bg-[#ab9a8c]"
        >
            {isSaving ? 'Analyzing...' : 'Log Meal'}
        </button>
        {message && <p className="mt-2 text-xs text-center text-emerald-700">{message}</p>}
        {error && <p className="mt-2 text-xs text-center text-red-700">{error}</p>}
      </div>
    </div>
  );
}

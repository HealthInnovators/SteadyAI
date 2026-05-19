'use client';

import { useAuth } from '@/auth';
import { createApiClient, type NutritionEntry } from '@/lib/api';
import { useMemo, useState } from 'react';

const QUICK_MEAL_PROMPTS = [
  'Greek yogurt with berries and granola',
  'Chicken salad bowl with avocado',
  'Two eggs, toast, and coffee',
  'Rice, dal, vegetables, and curd'
];

export function MealLogger({ onMealLogged, compact = false }: { onMealLogged: (newEntry: NutritionEntry) => void; compact?: boolean }) {
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
    <section className={`${compact ? '' : 'rounded-[34px] border border-white/80 p-5 shadow-[0_22px_70px_rgba(80,48,24,0.18)] sm:p-6'} bg-[linear-gradient(135deg,_#1d140d,_#7a4b28)] text-white dark:from-[#0f0b08] dark:to-[#4a372b]`}>
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f1d6b7]">Quick log</p>
      <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em]">What did you eat?</h3>
      <p className="mt-2 text-sm leading-6 text-[#fff4e7]">
        Type naturally. SteadyAI estimates calories and macros from your description.
      </p>
      <div className="mt-4">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {QUICK_MEAL_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setNutritionInput(prompt)}
              className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
            >
              {prompt}
            </button>
          ))}
        </div>
        <textarea
            value={nutritionInput}
            onChange={(event) => setNutritionInput(event.target.value)}
            placeholder="Example: Lemon herb chicken salad bowl with quinoa and yogurt dressing."
            className="min-h-28 w-full resize-none rounded-[24px] border border-white/20 bg-white/95 p-4 text-base leading-7 text-[#1d140d] outline-none ring-white/20 transition placeholder:text-[#9a897a] focus:border-white focus:ring-4"
        />
        <button
            type="button"
            onClick={submitNutritionLog}
            disabled={isSaving}
            className="mt-3 min-h-14 w-full rounded-full bg-[#fffaf5] px-5 py-4 text-base font-bold text-[#1d140d] shadow-[0_12px_28px_rgba(29,20,13,0.18)] transition active:scale-[0.99] disabled:bg-[#ab9a8c]"
        >
            {isSaving ? 'Analyzing...' : 'Log Meal'}
        </button>
        {message && <p className="mt-3 text-sm font-semibold text-emerald-100">{message}</p>}
        {error && <p className="mt-3 text-sm font-semibold text-red-100">{error}</p>}
      </div>
    </section>
  );
}

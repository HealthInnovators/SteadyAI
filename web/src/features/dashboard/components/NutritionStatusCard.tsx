'use client';

import { useAuth } from '@/auth';
import { createApiClient } from '@/lib/api';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface NutritionLogResult {
  id: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  consumedAt: string;
  createdAt: string;
}

// This is a simplified version of the StatTile from the original page.
function StatTile({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-lg border border-white/70 bg-white/50 p-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[#7a4b28]">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </div>
    );
  }

export function NutritionStatusCard() {
    const { token } = useAuth();
    const api = useMemo(() => createApiClient(token ?? undefined), [token]);

    const [nutritionInput, setNutritionInput] = useState('');
    const [nutritionLogs, setNutritionLogs] = useState<NutritionLogResult[]>([]);
    const [nutritionSaving, setNutritionSaving] = useState(false);
    const [nutritionMessage, setNutritionMessage] = useState<string | null>(null);
    const [nutritionError, setNutritionError] = useState<string | null>(null);

    const nutritionTotals = useMemo(
        () =>
          nutritionLogs.reduce(
            (acc, item) => {
              acc.calories += item.totalCalories;
              acc.protein += item.totalProteinG;
              acc.carbs += item.totalCarbsG;
              acc.fat += item.totalFatG;
              return acc;
            },
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          ),
        [nutritionLogs]
      );

    async function submitNutritionLog(rawText: string): Promise<void> {
        const trimmed = rawText.trim();
        if (!trimmed) {
          setNutritionError('Describe what you ate to log nutrition.');
          return;
        }

        setNutritionError(null);
        setNutritionMessage(null);
        setNutritionSaving(true);

        try {
          const response = await api.post<NutritionLogResult, { inputType: 'TEXT'; rawText: string; consumedAt?: string }>(
            '/api/nutrition/ingest',
            {
              body: {
                inputType: 'TEXT',
                rawText: trimmed,
              }
            }
          );

          setNutritionLogs((prev) => [response, ...prev].slice(0, 3));
          setNutritionInput('');
          setNutritionMessage('Meal captured.');
        } catch (error) {
          setNutritionError(error instanceof Error ? error.message : 'Failed to save nutrition entry.');
        } finally {
          setNutritionSaving(false);
        }
      }

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Nutrition</h3>
        <Link href="/ai-coach" className="text-sm font-medium text-[#7a4b28] hover:underline">
          Ask coach &rarr;
        </Link>
      </div>
      <div className="mt-4">
        <textarea
            value={nutritionInput}
            onChange={(event) => setNutritionInput(event.target.value)}
            placeholder="Log a meal, e.g., 'Greek yogurt and berries'"
            className="min-h-20 w-full rounded-lg border border-[#dccbbb] bg-white/80 p-2 text-sm outline-none transition focus:border-[#1d140d]"
        />
        <button
            type="button"
            onClick={() => submitNutritionLog(nutritionInput)}
            disabled={nutritionSaving}
            className="mt-2 w-full rounded-full bg-[#1d140d] px-5 py-2 text-sm text-white disabled:bg-[#ab9a8c]"
        >
            {nutritionSaving ? 'Logging...' : 'Log Meal'}
        </button>
        {nutritionMessage && <p className="mt-2 text-xs text-center text-emerald-700">{nutritionMessage}</p>}
        {nutritionError && <p className="mt-2 text-xs text-center text-red-700">{nutritionError}</p>}
      </div>

      {nutritionLogs.length > 0 ? (
         <div className="mt-4 grid grid-cols-2 gap-3">
            <StatTile label="Calories" value={String(nutritionTotals.calories)} />
            <StatTile label="Protein" value={`${nutritionTotals.protein}g`} />
        </div>
      ) : (
        <div className="mt-4 text-center">
            <p className="text-sm text-[#5f5145]">Log your first meal to see a summary here.</p>
        </div>
      )}
    </div>
  );
}

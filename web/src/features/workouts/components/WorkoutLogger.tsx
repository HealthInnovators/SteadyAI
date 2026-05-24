'use client';

import { useAuth } from '@/auth';
import { createApiClient } from '@/lib/api';
import { useMemo, useState } from 'react';

type WorkoutFeedback = 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD';

const feedbackOptions: Array<{ value: WorkoutFeedback; label: string }> = [
  { value: 'TOO_EASY', label: 'Too easy' },
  { value: 'JUST_RIGHT', label: 'Just right' },
  { value: 'TOO_HARD', label: 'Too hard' }
];

export function WorkoutLogger({ onLogged }: { onLogged?: () => void }) {
  const { token, userId } = useAuth();
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);
  const [duration, setDuration] = useState('20');
  const [completedExercises, setCompletedExercises] = useState('4');
  const [totalExercises, setTotalExercises] = useState('4');
  const [feedback, setFeedback] = useState<WorkoutFeedback>('JUST_RIGHT');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function applyCompletionPreset(preset: 'FULL' | 'MOST' | 'PARTIAL') {
    const total = Math.max(1, Number(totalExercises) || 1);

    if (preset === 'FULL') {
      setCompletedExercises(String(total));
      return;
    }

    if (preset === 'MOST') {
      setCompletedExercises(String(Math.max(1, Math.ceil(total * 0.75))));
      return;
    }

    setCompletedExercises(String(Math.max(1, Math.ceil(total * 0.5))));
  }

  async function submitWorkoutLog() {
    const parsedDuration = Number(duration);
    const parsedCompleted = Number(completedExercises);
    const parsedTotal = Number(totalExercises);

    if (!userId) {
      setError('A user profile is required to save workouts.');
      return;
    }

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setError('Enter workout duration in minutes.');
      return;
    }

    if (!Number.isFinite(parsedCompleted) || !Number.isFinite(parsedTotal) || parsedCompleted < 0 || parsedTotal <= 0 || parsedCompleted > parsedTotal) {
      setError('Enter a valid completed and total exercise count.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      await api.post('/api/workouts/session-summary', {
        body: {
          userId,
          sessionId: `manual-workout-${Date.now()}`,
          totalDurationMinutes: parsedDuration,
          completedExercises: parsedCompleted,
          totalExercises: parsedTotal,
          feedback,
          workoutPlan: {
            source: 'manual-mobile-log',
            title: 'Manual workout log'
          },
          sourceApp: 'steadyai-web'
        }
      });
      setMessage('Workout saved.');
      onLogged?.();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save workout.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[34px] border border-white/80 bg-[linear-gradient(135deg,_#1d140d,_#7a4b28)] p-5 text-white shadow-[0_22px_70px_rgba(80,48,24,0.18)] dark:from-[#0f0b08] dark:to-[#4a372b] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f1d6b7]">Workout log</p>
      <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em]">Log a workout you finished</h3>
      <p className="mt-2 text-sm leading-6 text-[#fff4e7]">
        Save what actually happened. SteadyAI uses this to update reports and make the next workout more realistic.
      </p>

      <div className="mt-5 rounded-[26px] border border-white/15 bg-white/10 p-4">
        <p className="text-sm font-bold text-white">1. How much of the workout did you complete?</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { value: 'FULL' as const, label: 'All of it' },
            { value: 'MOST' as const, label: 'Most' },
            { value: 'PARTIAL' as const, label: 'Some' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => applyCompletionPreset(option.value)}
              className="min-h-12 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition active:scale-[0.98]"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-3 text-sm font-bold text-white">2. Confirm the numbers</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NumberField label="Minutes moved" value={duration} onChange={setDuration} />
          <NumberField label="Exercises done" value={completedExercises} onChange={setCompletedExercises} />
          <NumberField label="Planned exercises" value={totalExercises} onChange={setTotalExercises} />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-bold text-white">3. How did it feel?</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {feedbackOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFeedback(option.value)}
              className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
                feedback === option.value ? 'border-[#fffaf5] bg-[#fffaf5] text-[#1d140d]' : 'border-white/25 bg-white/10 text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={submitWorkoutLog}
        disabled={isSaving}
        className="mt-4 min-h-14 w-full rounded-full bg-[#fffaf5] px-5 py-4 text-base font-bold text-[#1d140d] shadow-[0_12px_28px_rgba(29,20,13,0.18)] transition active:scale-[0.99] disabled:bg-[#ab9a8c]"
      >
        {isSaving ? 'Saving workout...' : 'Save completed workout'}
      </button>

      {message ? <p className="mt-3 text-sm font-semibold text-emerald-100">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-red-100">{error}</p> : null}
    </section>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#f1d6b7]">{label}</span>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-14 w-full rounded-[22px] border border-white/20 bg-white/95 px-4 py-3 text-base font-bold text-[#1d140d] outline-none ring-white/20 transition focus:border-white focus:ring-4"
      />
    </label>
  );
}

'use client';

import { useAuth } from '@/auth';
import { createApiClient } from '@/lib/api';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type WorkoutFeedback = 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD';

interface WorkoutExercise {
  id: string;
  name: string;
  durationMin: number;
  reps: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface WorkoutPlan {
  title: string;
  exercises: WorkoutExercise[];
}

const DEFAULT_WORKOUT_PLAN: WorkoutPlan = {
  title: 'Momentum builder: strength, posture, and core',
  exercises: [
    { id: 'ex-1', name: 'Goblet squat or bodyweight squat', durationMin: 8, reps: '3 sets of 12 reps', impact: 'MEDIUM' },
    { id: 'ex-2', name: 'Push-up progression', durationMin: 7, reps: '3 sets of 10 reps', impact: 'MEDIUM' },
    { id: 'ex-3', name: 'Split squat hold', durationMin: 6, reps: '2 sets of 30 seconds per side', impact: 'MEDIUM' },
    { id: 'ex-4', name: 'Dead bug and plank finisher', durationMin: 9, reps: '3 rounds', impact: 'LOW' }
  ]
};

// This is a simplified version of the StatTile from the original page.
function StatTile({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-[22px] border border-white/80 bg-white/72 p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7a4b28]">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">{value}</p>
      </div>
    );
  }

export function WorkoutStatusCard() {
  const { token, userId } = useAuth();
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);
  const [workoutPlan] = useState<WorkoutPlan>(DEFAULT_WORKOUT_PLAN);
  const [workoutFeedback, setWorkoutFeedback] = useState<WorkoutFeedback | null>(null);
  const [isWorkoutSaving, setWorkoutSaving] = useState(false);
  const [workoutSaveMessage, setWorkoutSaveMessage] = useState<string | null>(null);
  const [workoutSaveError, setWorkoutSaveError] = useState<string | null>(null);

  async function saveWorkoutSession(feedback: WorkoutFeedback): Promise<void> {
    if (!userId) {
      setWorkoutSaveError('A user profile is required to save workouts.');
      return;
    }

    setWorkoutSaveError(null);
    setWorkoutSaveMessage(null);
    setWorkoutSaving(true);
    setWorkoutFeedback(feedback);

    try {
      await api.post('/api/workouts/session-summary', {
        body: {
          userId,
          sessionId: `coach-plan-${new Date().toISOString().slice(0, 10)}`,
          totalDurationMinutes: workoutPlan.exercises.reduce((sum, exercise) => sum + exercise.durationMin, 0),
          completedExercises: workoutPlan.exercises.length,
          totalExercises: workoutPlan.exercises.length,
          feedback,
          workoutPlan,
          sourceApp: 'steadyai-web-dashboard'
        }
      });
      setWorkoutSaveMessage('Workout session saved.');
    } catch (error) {
      setWorkoutSaveError(error instanceof Error ? error.message : 'Failed to save workout session.');
    } finally {
      setWorkoutSaving(false);
    }
  }

  if (!workoutPlan) {
    return (
      <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-5 shadow-[0_18px_60px_rgba(80,48,24,0.1)]">
        <h3 className="text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Today&apos;s Workout</h3>
        <p className="mt-2 text-sm leading-6 text-[#5f5145]">No workout scheduled for today.</p>
        <Link href="/ai-coach" className="mt-4 inline-flex rounded-full bg-[#1d140d] px-5 py-3 text-sm font-semibold text-white">
          Ask for a workout
        </Link>
      </section>
    )
  }

  return (
    <section className="rounded-[34px] border border-white/80 bg-[linear-gradient(135deg,_#1d140d,_#7a4b28)] p-5 text-white shadow-[0_22px_70px_rgba(80,48,24,0.18)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f1d6b7]">Today&apos;s plan</p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em]">{workoutPlan.title}</h3>
        </div>
        <Link href="/ai-coach" className="inline-flex justify-center rounded-full bg-[#fffaf5] px-4 py-2 text-sm font-semibold text-[#1d140d]">
          Adjust plan
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile label="Exercises" value={String(workoutPlan.exercises.length)} />
        <StatTile label="Est. Time" value={`${workoutPlan.exercises.reduce((sum, item) => sum + item.durationMin, 0)} min`} />
      </div>
      <div className="mt-5 rounded-[26px] border border-white/15 bg-white/10 p-4 backdrop-blur">
        <p className="text-sm font-semibold text-[#fff4e7]">How did it feel?</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
            { key: 'TOO_EASY', label: 'Too easy' },
            { key: 'JUST_RIGHT', label: 'Just right' },
            { key: 'TOO_HARD', label: 'Too hard' }
        ].map((option) => (
            <button
            key={option.key}
            type="button"
            onClick={() => saveWorkoutSession(option.key as WorkoutFeedback)}
            disabled={isWorkoutSaving}
            className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
                workoutFeedback === option.key
                ? 'border-[#fffaf5] bg-[#fffaf5] text-[#1d140d]'
                : 'border-white/25 bg-white/10 text-white hover:bg-white/20'
            }`}
            >
            {isWorkoutSaving && workoutFeedback === option.key ? 'Saving...' : option.label}
            </button>
        ))}
        </div>
        {workoutSaveMessage && <p className="mt-3 text-sm font-semibold text-emerald-100">{workoutSaveMessage}</p>}
        {workoutSaveError && <p className="mt-3 text-sm font-semibold text-red-100">{workoutSaveError}</p>}
      </div>
    </section>
  );
}

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
    { id: 'ex-1', name: 'Goblet squat or bodyweight squat', durationMin: 8, reps: '3 x 12', impact: 'MEDIUM' },
    { id: 'ex-2', name: 'Push-up progression', durationMin: 7, reps: '3 x 10', impact: 'MEDIUM' },
    { id: 'ex-3', name: 'Split squat hold', durationMin: 6, reps: '2 x 30 sec / side', impact: 'MEDIUM' },
    { id: 'ex-4', name: 'Dead bug and plank finisher', durationMin: 9, reps: '3 rounds', impact: 'LOW' }
  ]
};

// This is a simplified version of the StatTile from the original page.
function StatTile({ label, value }: { label: string; value: string }) {
    return (
      <div className="rounded-lg border border-white/70 bg-white/50 p-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[#7a4b28]">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
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
        <div className="rounded-2xl border border-white/70 bg-white/50 p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Today&apos;s Workout</h3>
            <p className="mt-2 text-sm text-[#5f5145]">No workout scheduled for today.</p>
            <Link href="/workouts" className="mt-4 inline-block rounded-full bg-[#1d140d] px-4 py-2 text-sm text-white">
                Explore Workouts
            </Link>
        </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Today&apos;s Workout</h3>
        <Link href="/workouts" className="text-sm font-medium text-[#7a4b28] hover:underline">
          View Plan &rarr;
        </Link>
      </div>
      <p className="mt-1 text-sm text-[#5f5145]">{workoutPlan.title}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile label="Exercises" value={String(workoutPlan.exercises.length)} />
        <StatTile label="Est. Time" value={`${workoutPlan.exercises.reduce((sum, item) => sum + item.durationMin, 0)} min`} />
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-center text-[#4e4035]">How did it feel?</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
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
            className={`rounded-lg border px-3 py-2 text-xs transition ${
                workoutFeedback === option.key
                ? 'border-[#1d140d] bg-[#1d140d] text-white'
                : 'border-[#d8c4b3] bg-white/80 text-[#4e4035] hover:bg-[#f6ede4]'
            }`}
            >
            {isWorkoutSaving && workoutFeedback === option.key ? 'Saving...' : option.label}
            </button>
        ))}
        </div>
        {workoutSaveMessage && <p className="mt-2 text-xs text-center text-emerald-700">{workoutSaveMessage}</p>}
        {workoutSaveError && <p className="mt-2 text-xs text-center text-red-700">{workoutSaveError}</p>}
      </div>
    </div>
  );
}

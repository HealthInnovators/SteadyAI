'use client';

import { BottomSheet } from '@/components/BottomSheet';
import { WorkoutStatusCard } from '@/features/dashboard/components/WorkoutStatusCard';
import { ExerciseLibrary } from '@/features/workouts/components/ExerciseLibrary';
import { RecentSessionsCard } from '@/features/workouts/components/RecentSessionsCard';
import { WorkoutLogger } from '@/features/workouts/components/WorkoutLogger';
import { WorkoutPreferencesCard } from '@/features/workouts/components/WorkoutPreferencesCard';
import Link from 'next/link';
import { useState } from 'react';

export default function WorkoutsPage() {
  const [isWorkoutSheetOpen, setIsWorkoutSheetOpen] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  function handleWorkoutLogged() {
    setHistoryRefreshKey((value) => value + 1);
    setIsWorkoutSheetOpen(false);
  }

  return (
    <div className="min-h-screen px-4 pb-28 pt-4 sm:px-6 md:p-8">
      <header className="mb-5 rounded-[34px] border border-white/80 bg-[#fffaf5]/84 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.1)] dark:border-[#4a372b] dark:bg-[#231914]/88 dark:shadow-[0_18px_70px_rgba(0,0,0,0.28)] sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#8a4b22] dark:text-[#f3c99f]">Fitness expert</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.05em] text-[#1d140d] dark:text-[#fff7ed] sm:text-4xl">Workouts</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5145] dark:text-[#d6c2ae] sm:text-base">
              Get a plan, log how it felt, and review exercise demos from one phone-friendly workout hub.
            </p>
          </div>
          <Link
            href="/ai-coach"
            className="inline-flex justify-center rounded-full bg-[#1d140d] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(29,20,13,0.2)]"
          >
            Ask for today&apos;s workout
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <WorkoutStatusCard />
          <div className="hidden md:block">
            <WorkoutLogger onLogged={() => setHistoryRefreshKey((value) => value + 1)} />
          </div>
          <RecentSessionsCard refreshKey={historyRefreshKey} />
        </div>
        <div className="space-y-5">
          <WorkoutPreferencesCard />
          <ExerciseLibrary />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsWorkoutSheetOpen(true)}
        className="fixed bottom-[calc(5.75rem+var(--safe-bottom))] right-4 z-30 min-h-14 rounded-full bg-[#1d140d] px-5 py-4 text-base font-bold text-white shadow-[0_18px_46px_rgba(29,20,13,0.3)] active:scale-[0.99] dark:bg-[#fff7ed] dark:text-[#1d140d] md:hidden"
      >
        Log workout
      </button>

      <BottomSheet
        open={isWorkoutSheetOpen}
        title="Log a workout"
        description="Save a completed session so reports and future coaching stay accurate."
        onClose={() => setIsWorkoutSheetOpen(false)}
      >
        <WorkoutLogger onLogged={handleWorkoutLogged} />
      </BottomSheet>
    </div>
  );
}

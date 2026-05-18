'use client';

import { WorkoutStatusCard } from '@/features/dashboard/components/WorkoutStatusCard';
import { ExerciseLibrary } from '@/features/workouts/components/ExerciseLibrary';
import { RecentSessionsCard } from '@/features/workouts/components/RecentSessionsCard';
import { WorkoutPreferencesCard } from '@/features/workouts/components/WorkoutPreferencesCard';
import Link from 'next/link';

export default function WorkoutsPage() {
  return (
    <div className="min-h-screen px-4 pb-28 pt-4 sm:px-6 md:p-8">
      <header className="mb-5 rounded-[34px] border border-white/80 bg-[#fffaf5]/84 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.1)] sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#8a4b22]">Fitness expert</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.05em] text-[#1d140d] sm:text-4xl">Workouts</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5145] sm:text-base">
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
          <RecentSessionsCard />
        </div>
        <div className="space-y-5">
          <WorkoutPreferencesCard />
          <ExerciseLibrary />
        </div>
      </div>
    </div>
  );
}

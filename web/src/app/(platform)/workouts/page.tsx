'use client';

import { WorkoutStatusCard } from '@/features/dashboard/components/WorkoutStatusCard';
import { ExerciseLibrary } from '@/features/workouts/components/ExerciseLibrary';
import { RecentSessionsCard } from '@/features/workouts/components/RecentSessionsCard';
import { WorkoutPreferencesCard } from '@/features/workouts/components/WorkoutPreferencesCard';

export default function WorkoutsPage() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1d140d]">Workouts</h1>
        <p className="text-base text-[#5f5145]">Your central hub for fitness plans, history, and exercises.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
            <RecentSessionsCard />
            <ExerciseLibrary />
        </div>
        <div className="space-y-8">
            <WorkoutStatusCard />
            <WorkoutPreferencesCard />
        </div>
      </div>
    </div>
  );
}

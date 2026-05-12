'use client';

import { CoachingFocusCard } from '@/features/dashboard/components/CoachingFocusCard';
import { CommunityPromptCard } from '@/features/dashboard/components/CommunityPromptCard';
import { NutritionStatusCard } from '@/features/dashboard/components/NutritionStatusCard';
import { WeeklyReportCard } from '@/features/dashboard/components/WeeklyReportCard';
import { WorkoutStatusCard } from '@/features/dashboard/components/WorkoutStatusCard';


export default function PlatformHomePage() {
  return (
    <div className="p-6">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-[#1d140d]">Home</h1>
            <p className="text-base text-[#5f5145]">Welcome back, here is your dashboard for today.</p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
                <CoachingFocusCard />
            </div>

            <div className="space-y-6">
                <WorkoutStatusCard />
                <NutritionStatusCard />
            </div>

            <div className="lg:col-span-3">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <CommunityPromptCard />
                    <WeeklyReportCard />
                </div>
            </div>
        </div>
    </div>
  );
}

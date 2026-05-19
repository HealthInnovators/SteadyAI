'use client';

import { useAuth } from '@/auth';
import { createApiClient, type ReportsOverview } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';
import { CommunityReport } from '@/features/reports/components/CommunityReport';
import { NutritionReport } from '@/features/reports/components/NutritionReport';
import { WorkoutReport } from '@/features/reports/components/WorkoutReport';
import Link from 'next/link';
import { SkeletonCard } from '@/components/SkeletonCard';

export default function ReportsPage() {
  const { token } = useAuth();
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);
  const [reportData, setReportData] = useState<ReportsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true);
        const data = await api.getReportsOverview(30); // Fetch 30 days of data
        setReportData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports.');
      } finally {
        setLoading(false);
      }
    }
    fetchReportData();
  }, [api]);

  return (
    <div className="min-h-screen px-4 pb-28 pt-4 sm:px-6 md:p-8">
      <header className="mb-5 rounded-[34px] border border-white/80 bg-[#fffaf5]/84 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.1)] dark:border-[#4a372b] dark:bg-[#231914]/88 dark:shadow-[0_18px_70px_rgba(0,0,0,0.28)] sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#8a4b22] dark:text-[#f3c99f]">30-day progress</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.05em] text-[#1d140d] dark:text-[#fff7ed] sm:text-4xl">Reports</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5145] dark:text-[#d6c2ae] sm:text-base">
              See what you actually did, where your routine is gaining momentum, and what SteadyAI recommends next.
            </p>
          </div>
          <Link
            href="/ai-coach"
            className="inline-flex justify-center rounded-full bg-[#1d140d] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(29,20,13,0.2)]"
          >
            Ask coach what to do next
          </Link>
        </div>
      </header>

      {loading && <LoadingReports />}
      {error && <div className="mb-4 rounded-[24px] border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-700">{error}</div>}

      {reportData ? (
        <div className="space-y-5 sm:space-y-6">
          <ProgressSnapshot reportData={reportData} />
          <WorkoutReport data={{ ...reportData.workout, trend: reportData.trends.workoutMinutes }} />
          <NutritionReport data={{ ...reportData.nutrition, trend: reportData.trends.calories }} />
          <CommunityReport data={{ ...reportData.community, trend: reportData.trends.communityPosts }} />
        </div>
      ) : (
        !loading && !error && (
          <div className="rounded-[30px] border-2 border-dashed border-[#d8c4b3] bg-white/60 p-8 text-center">
            <p className="text-base font-semibold text-[#1d140d]">Not enough data to generate reports yet.</p>
            <p className="mt-2 text-sm text-[#5f5145]">Log workouts, meals, and check-ins to build your first progress snapshot.</p>
            <Link href="/ai-coach" className="mt-5 inline-flex rounded-full bg-[#1d140d] px-5 py-3 text-sm font-semibold text-white">
              Start with the coach
            </Link>
          </div>
        )
      )}
    </div>
  );
}

function ProgressSnapshot({ reportData }: { reportData: ReportsOverview }) {
  const completionRate = Math.round(reportData.challenge.completionRate * 100);
  const nextAction = getNextAction(reportData);

  return (
    <section className="rounded-[34px] border border-white/80 bg-[linear-gradient(135deg,_#1d140d,_#7a4b28)] p-5 text-white shadow-[0_22px_70px_rgba(80,48,24,0.18)] sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#f1d6b7]">Your snapshot</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{nextAction.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#fff4e7]">{nextAction.body}</p>
        </div>
        <Link href="/ai-coach" className="inline-flex justify-center rounded-full bg-[#fffaf5] px-5 py-3 text-sm font-semibold text-[#1d140d]">
          Get a plan
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <SnapshotTile label="Consistency" value={`${completionRate}%`} />
        <SnapshotTile label="Current streak" value={`${reportData.challenge.currentStreakDays}d`} />
        <SnapshotTile label="Workout time" value={`${reportData.workout.totalMinutes}m`} />
        <SnapshotTile label="Meals logged" value={String(reportData.nutrition.entries)} />
      </div>
    </section>
  );
}

function SnapshotTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f1d6b7]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-[-0.04em]">{value}</p>
    </div>
  );
}

function LoadingReports() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((item) => (
        <SkeletonCard key={item} rows={6} className="min-h-52" />
      ))}
    </div>
  );
}

function getNextAction(reportData: ReportsOverview): { title: string; body: string } {
  if (reportData.workout.sessions === 0) {
    return {
      title: 'Start with one short workout.',
      body: 'You have no workouts logged in this period. Ask SteadyAI for a 10-20 minute low-impact session and log it when done.'
    };
  }

  if (reportData.nutrition.entries < 3) {
    return {
      title: 'Make nutrition tracking easier.',
      body: 'Your workout data has started, but meal logs are still light. Try logging one meal today, even if the estimate is imperfect.'
    };
  }

  if (reportData.challenge.currentStreakDays < 2) {
    return {
      title: 'Build a two-day streak.',
      body: 'Your next win is consistency. Use the coach to choose one realistic action for today and check in after completing it.'
    };
  }

  return {
    title: 'You have momentum.',
    body: 'Your logs show activity across the app. Review the trends below and ask the coach for one adjustment to keep the routine sustainable.'
  };
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth, useRequireAuth } from '@/auth';
import { createApiClient } from '@/lib/api';
import { getReportsOverview, type ReportsOverview } from '@/features/reports';

const WINDOW_OPTIONS = [7, 14, 30] as const;

function TrendBars({
  title,
  series,
  colorClass
}: {
  title: string;
  series: Array<{ date: string; label: string; value: number }>;
  colorClass: string;
}) {
  const max = Math.max(1, ...series.map((item) => item.value));

  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      <div className="mt-3 grid grid-cols-7 items-end gap-2">
        {series.map((point) => {
          const pct = Math.max(6, Math.round((point.value / max) * 100));
          return (
            <div key={point.date} className="flex flex-col items-center gap-1">
              <p className="text-[10px] text-gray-500">{point.value}</p>
              <div className="flex h-24 w-full items-end">
                <div
                  className={`w-full rounded-sm ${colorClass}`}
                  style={{ height: `${pct}%` }}
                  title={`${point.date}: ${point.value}`}
                />
              </div>
              <p className="text-[10px] text-gray-500">{point.label}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default function ReportsPage() {
  const { token } = useAuth();
  const { isHydrated, isAuthorized } = useRequireAuth();
  const [days, setDays] = useState<number>(7);
  const [data, setData] = useState<ReportsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useMemo(() => createApiClient(token ?? undefined), [token]);

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    async function run() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getReportsOverview(api, days);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    }

    void run();
  }, [api, days, isAuthorized]);

  if (!isHydrated || !isAuthorized) {
    return <main className="mx-auto max-w-3xl p-6 text-sm text-gray-600">Checking authentication...</main>;
  }

  const challengeRate = data ? Math.round(data.challenge.completionRate * 100) : 0;
  const workoutRate = data?.workout.avgCompletionRate !== null && data?.workout.avgCompletionRate !== undefined
    ? Math.round(data.workout.avgCompletionRate * 100)
    : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-gray-600">Weekly and monthly progress across challenge, nutrition, workouts, and community.</p>
        </div>
        <div className="flex items-center gap-2">
          {WINDOW_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDays(option)}
              className={`rounded-md border px-3 py-2 text-sm ${
                days === option ? 'border-black bg-black text-white' : 'border-gray-300'
              }`}
            >
              {option}d
            </button>
          ))}
        </div>
      </header>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {isLoading && !data ? <p className="text-sm text-gray-600">Loading report...</p> : null}

      {data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Check-ins</p>
              <p className="mt-2 text-2xl font-semibold">{data.challenge.totalCheckIns}</p>
              <p className="mt-1 text-sm text-gray-600">{challengeRate}% completed</p>
            </article>
            <article className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Streak</p>
              <p className="mt-2 text-2xl font-semibold">{data.challenge.currentStreakDays} days</p>
              <p className="mt-1 text-sm text-gray-600">{data.challenge.activeParticipation ? 'Active challenge member' : 'No active challenge'}</p>
            </article>
            <article className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Nutrition</p>
              <p className="mt-2 text-2xl font-semibold">{data.nutrition.calories} kcal</p>
              <p className="mt-1 text-sm text-gray-600">{data.nutrition.entries} entries logged</p>
            </article>
            <article className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Workouts</p>
              <p className="mt-2 text-2xl font-semibold">{data.workout.sessions}</p>
              <p className="mt-1 text-sm text-gray-600">{data.workout.totalMinutes} total min</p>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Challenge Adherence</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p>Completed: <strong>{data.challenge.completed}</strong></p>
                <p>Partial: <strong>{data.challenge.partial}</strong></p>
                <p>Skipped: <strong>{data.challenge.skipped}</strong></p>
                <p>Completion rate: <strong>{challengeRate}%</strong></p>
              </div>
            </article>
            <article className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Nutrition Breakdown</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p>Protein: <strong>{data.nutrition.proteinG}g</strong></p>
                <p>Carbs: <strong>{data.nutrition.carbsG}g</strong></p>
                <p>Fat: <strong>{data.nutrition.fatG}g</strong></p>
                <p>Avg kcal/entry: <strong>{data.nutrition.avgCaloriesPerEntry}</strong></p>
              </div>
            </article>
            <article className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Workout Summary</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p>Avg min/session: <strong>{data.workout.avgMinutesPerSession}</strong></p>
                <p>Avg completion: <strong>{workoutRate !== null ? `${workoutRate}%` : 'N/A'}</strong></p>
                <p>Too easy: <strong>{data.workout.feedback.TOO_EASY}</strong></p>
                <p>Just right: <strong>{data.workout.feedback.JUST_RIGHT}</strong></p>
                <p>Too hard: <strong>{data.workout.feedback.TOO_HARD}</strong></p>
              </div>
            </article>
            <article className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold">Community Engagement</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <p>Posts: <strong>{data.community.posts}</strong></p>
                <p>Reactions given: <strong>{data.community.reactionsGiven}</strong></p>
                <p>Reactions received: <strong>{data.community.reactionsReceived}</strong></p>
                <p>Replies received: <strong>{data.community.repliesReceived}</strong></p>
                <p>Wins: <strong>{data.community.postTypes.WIN}</strong></p>
                <p>Questions: <strong>{data.community.postTypes.QUESTION}</strong></p>
              </div>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <TrendBars title={`Completed Check-ins (${data.trends.days}d)`} series={data.trends.checkInsCompleted} colorClass="bg-emerald-500" />
            <TrendBars title={`Calories (${data.trends.days}d)`} series={data.trends.calories} colorClass="bg-amber-500" />
            <TrendBars title={`Workout Minutes (${data.trends.days}d)`} series={data.trends.workoutMinutes} colorClass="bg-blue-500" />
            <TrendBars title={`Community Posts (${data.trends.days}d)`} series={data.trends.communityPosts} colorClass="bg-violet-500" />
          </section>
        </>
      ) : null}
    </main>
  );
}

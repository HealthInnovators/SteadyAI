'use client';

import { useAuth } from '@/auth';
import { SkeletonCard } from '@/components/SkeletonCard';
import { createApiClient, type WorkoutHistorySummary } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

function HistoryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[22px] border border-white/80 bg-white/72 p-4 shadow-[0_10px_32px_rgba(80,48,24,0.07)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a4b28]">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[#1d140d]">{value}</p>
    </div>
  );
}

export function RecentSessionsCard({ refreshKey = 0 }: { refreshKey?: number }) {
  const { token } = useAuth();
  const api = useMemo(() => createApiClient(token ?? undefined), [token]);
  const [history, setHistory] = useState<WorkoutHistorySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const hist = await api.getWorkoutHistory();
        setHistory(hist);
      } catch (error) {
        console.error('Failed to load workout history:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [api, refreshKey]);

  if (loading) {
    return (
      <SkeletonCard rows={5} className="min-h-52" />
    );
  }

  return (
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Last 30 days</p>
          <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Recent Activity</h3>
        </div>
        {history?.lastFeedback ? (
          <p className="rounded-full bg-[#f3e7da] px-3 py-1 text-xs font-semibold capitalize text-[#7a4b28]">
            Last felt {history.lastFeedback.replace('_', ' ').toLowerCase()}
          </p>
        ) : null}
      </div>
      {history && history.sessions > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <HistoryStat label="Sessions" value={history.sessions} />
          <HistoryStat label="Avg. Duration" value={`${Math.round(history.avgDurationMinutes)} min`} />
          <HistoryStat label="Completion" value={`${Math.round(history.avgCompletionRate * 100)}%`} />
          <HistoryStat label="Current Streak" value={`${history.streakDays} days`} />
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[#d8c4b3] bg-white/60 p-5">
          <p className="text-base font-semibold text-[#1d140d]">No recent workout sessions logged.</p>
          <p className="mt-2 text-sm leading-6 text-[#5f5145]">Ask SteadyAI for a realistic session, then save how it felt here.</p>
        </div>
      )}
    </section>
  );
}

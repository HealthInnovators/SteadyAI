'use client';

import { useAuth } from '@/auth';
import { createApiClient, type WorkoutHistorySummary } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

function HistoryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/70 bg-white/50 p-4 text-center">
      <p className="text-3xl font-semibold text-[#1d140d]">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-[#7a4b28]">{label}</p>
    </div>
  );
}

export function RecentSessionsCard() {
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
  }, [api]);

  if (loading) {
    return <div className="p-4 text-center">Loading workout history...</div>;
  }

  return (
    <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-[#1d140d]">Recent Activity (Last 30 Days)</h3>
      {history && history.sessions > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <HistoryStat label="Sessions" value={history.sessions} />
          <HistoryStat label="Avg. Duration" value={`${Math.round(history.avgDurationMinutes)} min`} />
          <HistoryStat label="Completion" value={`${Math.round(history.avgCompletionRate * 100)}%`} />
          <HistoryStat label="Current Streak" value={`${history.streakDays} days`} />
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#5f5145]">No recent workout sessions logged. Let&apos;s get moving!</p>
      )}
    </div>
  );
}

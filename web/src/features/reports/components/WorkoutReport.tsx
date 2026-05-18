import { SummaryCard } from './SummaryCard';
import { TrendChart } from './TrendChart';
import type { ReportsOverview } from '@/lib/api';

export function WorkoutReport({ data }: { data: ReportsOverview['workout'] & { trend: ReportsOverview['trends']['workoutMinutes'] } }) {
  const completion = data.avgCompletionRate ? `${Math.round(data.avgCompletionRate * 100)}%` : 'N/A';
  const bestFeedback = Object.entries(data.feedback).sort((a, b) => b[1] - a[1])[0];
  const feedbackLabel = bestFeedback && bestFeedback[1] > 0 ? bestFeedback[0].replace('_', ' ').toLowerCase() : 'No feedback yet';

  return (
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Movement</p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Workouts</h2>
        </div>
        <p className="rounded-full bg-[#f3e7da] px-3 py-1 text-xs font-semibold capitalize text-[#7a4b28]">Most common: {feedbackLabel}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard title="Sessions" value={data.sessions} />
        <SummaryCard title="Total Time" value={data.totalMinutes} unit="min" />
        <SummaryCard title="Avg. Time" value={data.avgMinutesPerSession} unit="min" />
        <SummaryCard title="Avg. Completion" value={completion} />
      </div>
      <div className="mt-6">
        <TrendChart title="Workout Minutes Trend" data={data.trend} />
      </div>
    </section>
  );
}

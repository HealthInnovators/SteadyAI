import { SummaryCard } from './SummaryCard';
import { TrendChart } from './TrendChart';
import type { ReportsOverview } from '@/lib/api';

export function WorkoutReport({ data }: { data: ReportsOverview['workout'] & { trend: ReportsOverview['trends']['workoutMinutes'] } }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-[#1d140d] mb-4">Workouts</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Sessions" value={data.sessions} />
        <SummaryCard title="Total Time" value={data.totalMinutes} unit="min" />
        <SummaryCard title="Avg. Time" value={data.avgMinutesPerSession} unit="min" />
        <SummaryCard title="Avg. Completion" value={data.avgCompletionRate ? `${Math.round(data.avgCompletionRate * 100)}%` : 'N/A'} />
      </div>
      <div className="mt-6">
        <TrendChart title="Workout Minutes Trend" data={data.trend} />
      </div>
    </section>
  );
}

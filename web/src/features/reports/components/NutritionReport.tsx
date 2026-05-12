import { SummaryCard } from './SummaryCard';
import { TrendChart } from './TrendChart';
import type { ReportsOverview } from '@/lib/api';

export function NutritionReport({ data }: { data: ReportsOverview['nutrition'] & { trend: ReportsOverview['trends']['calories'] } }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-[#1d140d] mb-4">Nutrition</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Meals Logged" value={data.entries} />
        <SummaryCard title="Avg. Calories" value={data.avgCaloriesPerEntry} unit="kcal" />
        <SummaryCard title="Total Protein" value={data.proteinG} unit="g" />
        <SummaryCard title="Total Carbs" value={data.carbsG} unit="g" />
      </div>
      <div className="mt-6">
        <TrendChart title="Calorie Intake Trend" data={data.trend} />
      </div>
    </section>
  );
}

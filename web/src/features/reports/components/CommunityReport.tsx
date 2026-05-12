import { SummaryCard } from './SummaryCard';
import { TrendChart } from './TrendChart';
import type { ReportsOverview } from '@/lib/api';

export function CommunityReport({ data }: { data: ReportsOverview['community'] & { trend: ReportsOverview['trends']['communityPosts'] } }) {
  return (
    <section>
      <h2 className="text-2xl font-bold text-[#1d140d] mb-4">Community</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard title="Posts Created" value={data.posts} />
        <SummaryCard title="Reactions Given" value={data.reactionsGiven} />
        <SummaryCard title="Reactions Received" value={data.reactionsReceived} />
        <SummaryCard title="Replies Received" value={data.repliesReceived} />
      </div>
      <div className="mt-6">
        <TrendChart title="Posts Trend" data={data.trend} />
      </div>
    </section>
  );
}

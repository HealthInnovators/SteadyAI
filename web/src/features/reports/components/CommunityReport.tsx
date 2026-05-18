import { SummaryCard } from './SummaryCard';
import { TrendChart } from './TrendChart';
import type { ReportsOverview } from '@/lib/api';

export function CommunityReport({ data }: { data: ReportsOverview['community'] & { trend: ReportsOverview['trends']['communityPosts'] } }) {
  return (
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Accountability</p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Community</h2>
        </div>
        <p className="rounded-full bg-[#f3e7da] px-3 py-1 text-xs font-semibold text-[#7a4b28]">{data.postTypes.CHECK_IN} check-in post{data.postTypes.CHECK_IN === 1 ? '' : 's'}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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

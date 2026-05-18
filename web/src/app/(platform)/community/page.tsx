'use client';

import { useCommunity, CommunityProvider } from '@/features/community/CommunityProvider';
import { PostCreator } from '@/features/community/components/PostCreator';
import { FeedList } from '@/features/community/components/FeedList';
import Link from 'next/link';

function CommunityPageContent() {
  const { error, groupId } = useCommunity();

  if (error) {
    return <div className="mb-4 rounded-[24px] border border-red-200 bg-red-50 p-4 text-center text-sm font-medium text-red-700">{error}</div>;
  }

  if (!groupId) {
    return (
        <div className="rounded-[30px] border-2 border-dashed border-[#d8c4b3] bg-white/60 p-8 text-center">
            <p className="text-base font-semibold text-[#1d140d]">You are not currently in a community group.</p>
            <p className="mt-2 text-sm text-[#5f5145]">Complete onboarding to be assigned to a group.</p>
            <Link href="/onboarding/goal" className="mt-5 inline-flex rounded-full bg-[#1d140d] px-5 py-3 text-sm font-semibold text-white">
              Finish onboarding
            </Link>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.85fr_1.15fr]">
      <div>
        <PostCreator />
      </div>
      <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] sm:p-6">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#8a4b22]">Peer feed</p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[#1d140d]">Community Updates</h2>
        </div>
        <FeedList />
      </section>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <CommunityProvider>
        <div className="min-h-screen px-4 pb-28 pt-4 sm:px-6 md:p-8">
            <header className="mb-5 rounded-[34px] border border-white/80 bg-[#fffaf5]/84 p-5 shadow-[0_18px_70px_rgba(80,48,24,0.1)] sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#8a4b22]">Accountability</p>
                <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold tracking-[-0.05em] text-[#1d140d] sm:text-4xl">Community</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f5145] sm:text-base">
                      Share quick wins, ask low-pressure questions, and stay connected to people building steady routines.
                    </p>
                  </div>
                  <Link
                    href="/ai-coach"
                    className="inline-flex justify-center rounded-full bg-[#1d140d] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(29,20,13,0.2)]"
                  >
                    Draft a post with coach
                  </Link>
                </div>
            </header>
            <CommunityPageContent />
        </div>
    </CommunityProvider>
  );
}

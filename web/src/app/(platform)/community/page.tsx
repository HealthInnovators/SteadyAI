'use client';

import { useCommunity, CommunityProvider } from '@/features/community/CommunityProvider';
import { PostCreator } from '@/features/community/components/PostCreator';
import { FeedList } from '@/features/community/components/FeedList';

function CommunityPageContent() {
  const { error, groupId } = useCommunity();

  if (error) {
    return <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-lg">{error}</div>;
  }

  if (!groupId) {
    return (
        <div className="text-center p-8 rounded-lg border-2 border-dashed border-[#ead9ca]">
            <p className="text-sm text-[#5f5145]">You are not currently in a community group.</p>
            <p className="mt-1 text-xs text-[#7a4b28]">Complete onboarding to be assigned to a group.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <PostCreator />
      </div>
      <div className="md:col-span-2">
        <FeedList />
      </div>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <CommunityProvider>
        <div className="p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-[#1d140d]">Community</h1>
                <p className="text-base text-[#5f5145]">Connect with others, share your wins, and ask questions.</p>
            </header>
            <CommunityPageContent />
        </div>
    </CommunityProvider>
  );
}

'use client';

import { useAuth, useRequireAuth } from '@/auth';
import { CreatePostModal, FeedList, useCommunityFeed } from '@/features/community';
import { useState } from 'react';

export default function CommunityPage() {
  const { token } = useAuth();
  const { isHydrated, isAuthorized } = useRequireAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const {
    posts,
    groupId,
    activeChallengeId,
    isLoading,
    isRefreshing,
    isCreating,
    error,
    currentUserId,
    refresh,
    createPost,
    toggleReaction
  } = useCommunityFeed({
    token,
    enabled: isAuthorized
  });

  if (!isHydrated || !isAuthorized) {
    return <main className="mx-auto max-w-3xl p-6 text-sm text-gray-600">Checking authentication...</main>;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Community Feed</h1>
          <p className="text-sm text-gray-600">Group: {groupId || 'Not assigned'} | Challenge: {activeChallengeId || 'None'}</p>
          <p className="text-xs text-gray-500">Auto-refresh every 20 seconds.</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            New post
          </button>
          <button
            type="button"
            onClick={() => void refresh('manual')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm"
            disabled={isRefreshing || isLoading}
          >
            {isRefreshing || isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {error ? <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

      {isLoading ? (
        <p className="text-sm text-gray-600">Loading feed...</p>
      ) : (
        <FeedList posts={posts} currentUserId={currentUserId} onReact={(postId, type) => void toggleReaction(postId, type)} />
      )}

      <CreatePostModal
        isOpen={isModalOpen}
        isSubmitting={isCreating}
        onClose={() => setModalOpen(false)}
        onSubmit={createPost}
      />
    </main>
  );
}

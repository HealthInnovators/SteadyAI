'use client';

import type { CommunityPost, ReactionType } from '../types';

const REACTION_TYPES: ReactionType[] = ['LIKE', 'CELEBRATE', 'SUPPORT'];

interface FeedListProps {
  posts: CommunityPost[];
  currentUserId: string | null;
  onReact: (postId: string, type: ReactionType) => void;
}

export function FeedList({ posts, currentUserId, onReact }: FeedListProps) {
  if (posts.length === 0) {
    return <p className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">No posts yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {posts.map((post) => {
        const myReaction = post.reactions.find((reaction) => reaction.userId === currentUserId)?.type;
        const reactionCounts = post.reactions.reduce<Record<ReactionType, number>>(
          (acc, reaction) => {
            acc[reaction.type] += 1;
            return acc;
          },
          { LIKE: 0, CELEBRATE: 0, SUPPORT: 0 }
        );

        return (
          <li key={post.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">{post.author.displayName || post.author.username}</p>
              <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
            </div>

            <p className="mb-1 text-xs font-medium tracking-wide text-gray-500">{post.type || 'UPDATE'}</p>
            <p className="text-sm text-gray-900">{post.content}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {REACTION_TYPES.map((type) => {
                const selected = myReaction === type;
                const count = reactionCounts[type];

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onReact(post.id, type)}
                    className={`rounded-md border px-3 py-1 text-xs ${
                      selected ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {type} {count > 0 ? count : ''}
                  </button>
                );
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

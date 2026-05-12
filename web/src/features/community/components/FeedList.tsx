'use client';

import { useCommunity } from '../CommunityProvider';
import type { CommunityPost, ReactionType } from '../types';

function PostCard({ post, currentUserId }: { post: CommunityPost; currentUserId: string | null; }) {
    const { toggleReaction } = useCommunity();
    const userReaction = post.reactions.find(r => r.userId === currentUserId);

    return (
        <div className="rounded-2xl border border-white/70 bg-white/50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div>
                    <p className="text-sm font-semibold">{post.author.displayName || post.author.username}</p>
                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
            </div>
            <p className="mt-4 text-sm text-[#4e4035]">{post.content}</p>
            <div className="mt-4 flex gap-2">
                {(['LIKE', 'CELEBRATE', 'SUPPORT'] as ReactionType[]).map(type => (
                    <button 
                        key={type}
                        onClick={() => toggleReaction(post.id, type)}
                        className={`px-3 py-1 text-xs rounded-full flex items-center gap-1 ${userReaction?.type === type ? 'bg-blue-100 border-blue-200' : 'bg-white/80 border'}`}
                    >
                        <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                        <span className="text-gray-500">{post.reactions.filter(r => r.type === type).length}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}


export function FeedList() {
    const { posts, isLoading, currentUserId } = useCommunity();

    if (isLoading) {
        return <p className="text-sm text-gray-600">Loading feed...</p>;
    }
    
    return (
        <div className="space-y-4">
            {posts.map((post: CommunityPost) => (
                <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}
        </div>
    );
}

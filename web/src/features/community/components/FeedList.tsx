'use client';

import { useCommunity } from '../CommunityProvider';
import type { CommunityPost, ReactionType } from '../types';

const REACTION_LABELS: Record<ReactionType, string> = {
    LIKE: 'Like',
    CELEBRATE: 'Celebrate',
    SUPPORT: 'Support'
};

const POST_TYPE_LABELS = {
    WIN: 'Win',
    QUESTION: 'Question',
    CHECK_IN: 'Check-in'
};

function PostCard({ post, currentUserId }: { post: CommunityPost; currentUserId: string | null; }) {
    const { toggleReaction } = useCommunity();
    const userReaction = post.reactions.find(r => r.userId === currentUserId);
    const displayName = post.author.displayName || post.author.username || 'Community member';
    const initials = displayName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();

    return (
        <article className="rounded-[28px] border border-white/80 bg-white/78 p-4 shadow-[0_12px_36px_rgba(80,48,24,0.08)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1d140d] text-sm font-bold text-white">
                        {initials || 'S'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#1d140d]">{displayName}</p>
                        <p className="mt-0.5 text-xs font-medium text-[#7a4b28]">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                {post.type ? (
                    <span className="shrink-0 rounded-full bg-[#f3e7da] px-3 py-1 text-xs font-semibold text-[#7a4b28]">
                        {POST_TYPE_LABELS[post.type]}
                    </span>
                ) : null}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-[#4e4035]">{post.content}</p>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {(['LIKE', 'CELEBRATE', 'SUPPORT'] as ReactionType[]).map(type => (
                    <button 
                        key={type}
                        onClick={() => toggleReaction(post.id, type)}
                        className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
                            userReaction?.type === type
                                ? 'border-[#1d140d] bg-[#1d140d] text-white'
                                : 'border-[#d8c4b3] bg-white/80 text-[#4e4035] hover:bg-[#f3e7da]'
                        }`}
                    >
                        <span>{REACTION_LABELS[type]}</span>
                        <span className={userReaction?.type === type ? 'text-[#f1d6b7]' : 'text-[#7a4b28]'}>
                            {post.reactions.filter(r => r.type === type).length}
                        </span>
                    </button>
                ))}
            </div>
        </article>
    );
}


export function FeedList() {
    const { posts, isLoading, currentUserId } = useCommunity();

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[0, 1, 2].map(item => (
                    <div key={item} className="animate-pulse rounded-[28px] border border-white/80 bg-white/60 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-2xl bg-[#ead9ca]" />
                            <div className="flex-1">
                                <div className="h-4 w-32 rounded-full bg-[#ead9ca]" />
                                <div className="mt-2 h-3 w-24 rounded-full bg-[#f3e7da]" />
                            </div>
                        </div>
                        <div className="mt-4 h-16 rounded-[20px] bg-[#f3e7da]" />
                    </div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="rounded-[30px] border-2 border-dashed border-[#d8c4b3] bg-white/60 p-8 text-center">
                <p className="text-base font-semibold text-[#1d140d]">No posts yet.</p>
                <p className="mt-2 text-sm text-[#5f5145]">Share a quick win, question, or check-in to start the feed.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3">
            {posts.map((post: CommunityPost) => (
                <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}
        </div>
    );
}

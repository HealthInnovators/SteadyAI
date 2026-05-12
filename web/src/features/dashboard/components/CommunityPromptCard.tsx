'use client';

import { useAuth } from '@/auth';
import { useCommunityFeed } from '@/features/community';
import Link from 'next/link';

export function CommunityPromptCard() {
    const { token } = useAuth();
    const { posts, isLoading } = useCommunityFeed({ token, enabled: true });

    const latestPost = posts?.[0];

    return (
        <div className="rounded-2xl border border-white/70 bg-white/50 p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Community</h3>
                <Link href="/community" className="text-sm font-medium text-[#7a4b28] hover:underline">
                View Feed &rarr;
                </Link>
            </div>
            {isLoading ? (
                 <p className="mt-2 text-sm text-[#5f5145]">Loading feed...</p>
            ) : latestPost ? (
                <div className="mt-4 rounded-lg bg-white/50 p-3">
                    <p className="text-sm font-medium">{(latestPost.author.displayName || latestPost.author.username) || 'A member'} shared a {latestPost.type?.toLowerCase()}:</p>
                    <p className="mt-1 text-sm text-ellipsis overflow-hidden whitespace-nowrap text-[#5f5145]">
                        {latestPost.content}
                    </p>
                </div>
            ) : (
                <p className="mt-2 text-sm text-[#5f5145]">No community posts yet. Be the first!</p>
            )}
             <Link href="/community" className="mt-4 block w-full text-center rounded-full bg-[#1d140d] px-5 py-2 text-sm text-white">
                Post a Win or Question
            </Link>
        </div>
    );
}

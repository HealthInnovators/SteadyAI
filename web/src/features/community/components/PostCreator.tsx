'use client';

import { useCommunity } from '../CommunityProvider';
import { useState } from 'react';
import type { PostType } from '../types';

const POST_TYPE_LABELS: Record<PostType, string> = {
    WIN: 'Win',
    QUESTION: 'Question',
    CHECK_IN: 'Check-in'
};

const PROMPTS: Record<PostType, string[]> = {
    WIN: ['I showed up today by...', 'A small win I want to remember is...', 'I made progress when...'],
    QUESTION: ['How do you handle...', 'What helps you stay consistent with...', 'Any simple ideas for...'],
    CHECK_IN: ['Today I completed...', 'My energy today was...', 'One thing I will do next is...']
};

export function PostCreator({ compact = false, onPostCreated }: { compact?: boolean; onPostCreated?: () => void }) {
    const { createPost, isCreating } = useCommunity();
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState<PostType>('WIN');
    const [error, setError] = useState<string | null>(null);

    const handleCreatePost = async () => {
        if (!content.trim()) {
            setError('Post content cannot be empty.');
            return;
        }
        setError(null);
        try {
            await createPost(postType, content);
            setContent('');
            onPostCreated?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create post.');
        }
    };
    
    return (
        <section className={`${compact ? '' : 'rounded-[34px] border border-white/80 p-5 shadow-[0_22px_70px_rgba(80,48,24,0.18)] sm:p-6'} bg-[linear-gradient(135deg,_#1d140d,_#7a4b28)] text-white dark:from-[#0f0b08] dark:to-[#4a372b]`}>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f1d6b7]">Share with your group</p>
            <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em]">Create a Post</h3>
            <p className="mt-2 text-sm leading-6 text-[#fff4e7]">Keep it short and human. Wins, questions, and check-ins all count.</p>
            <div className="mt-4">
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {(['WIN', 'QUESTION', 'CHECK_IN'] as PostType[]).map(type => (
                        <button 
                            key={type}
                            onClick={() => setPostType(type)}
                            className={`shrink-0 rounded-full border px-3 py-2 text-sm font-semibold ${
                                postType === type ? 'border-[#fffaf5] bg-[#fffaf5] text-[#1d140d]' : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            {POST_TYPE_LABELS[type]}
                        </button>
                    ))}
                </div>
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                    {PROMPTS[postType].map(prompt => (
                        <button
                            key={prompt}
                            type="button"
                            onClick={() => setContent(prompt)}
                            className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                        postType === 'WIN' ? "What's a recent win?" :
                        postType === 'QUESTION' ? "What's on your mind?" :
                        "How was your check-in?"
                    }
                    className="min-h-32 w-full resize-none rounded-[24px] border border-white/20 bg-white/95 p-4 text-base leading-7 text-[#1d140d] outline-none ring-white/20 transition placeholder:text-[#9a897a] focus:border-white focus:ring-4"
                />
                <button
                    onClick={handleCreatePost}
                    disabled={isCreating}
                    className="mt-3 min-h-14 w-full rounded-full bg-[#fffaf5] px-5 py-4 text-base font-bold text-[#1d140d] shadow-[0_12px_28px_rgba(29,20,13,0.18)] transition active:scale-[0.99] disabled:bg-[#ab9a8c]"
                >
                    {isCreating ? 'Posting...' : 'Post to Feed'}
                </button>
                {error && <p className="mt-3 text-sm font-semibold text-red-100">{error}</p>}
            </div>
        </section>
    );
}

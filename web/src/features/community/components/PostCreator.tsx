'use client';

import { useCommunity } from '../CommunityProvider';
import { useState } from 'react';
import type { PostType } from '../types';

export function PostCreator() {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create post.');
        }
    };
    
    return (
        <div className="rounded-2xl border border-white/70 bg-white/50 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-[#1d140d]">Create a Post</h3>
            <div className="mt-4">
                <div className="flex gap-2 mb-3">
                    {(['WIN', 'QUESTION', 'CHECK_IN'] as PostType[]).map(type => (
                        <button 
                            key={type}
                            onClick={() => setPostType(type)}
                            className={`px-3 py-1 text-sm rounded-full ${postType === type ? 'bg-[#1d140d] text-white' : 'bg-white/80'}`}
                        >
                            {type.charAt(0) + type.slice(1).toLowerCase()}
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
                    className="w-full min-h-24 p-3 rounded-lg border border-[#dccbbb] bg-white/80"
                />
                <button
                    onClick={handleCreatePost}
                    disabled={isCreating}
                    className="mt-3 w-full rounded-full bg-[#1d140d] px-5 py-3 text-sm font-medium text-white disabled:bg-[#ab9a8c]"
                >
                    {isCreating ? 'Posting...' : 'Post to Feed'}
                </button>
                {error && <p className="mt-2 text-xs text-center text-red-700">{error}</p>}
            </div>
        </div>
    );
}

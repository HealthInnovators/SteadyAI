'use client';

import { useState } from 'react';
import type { PostType } from '../types';

const POST_TYPES: PostType[] = ['WIN', 'QUESTION', 'CHECK_IN'];

interface CreatePostModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (type: PostType, content: string) => Promise<void>;
}

export function CreatePostModal({ isOpen, isSubmitting, onClose, onSubmit }: CreatePostModalProps) {
  const [type, setType] = useState<PostType>('WIN');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-lg">
        <h2 className="text-lg font-semibold">Create post</h2>
        <p className="mt-1 text-sm text-gray-600">Share a quick update with your community.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {POST_TYPES.map((postType) => (
            <button
              key={postType}
              type="button"
              onClick={() => setType(postType)}
              className={`rounded-md border px-3 py-2 text-sm ${
                type === postType ? 'border-black bg-black text-white' : 'border-gray-300 bg-white'
              }`}
            >
              {postType}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            setError(null);
          }}
          placeholder="What happened today?"
          className="mt-4 min-h-28 w-full rounded-md border border-gray-300 p-3 text-sm"
          maxLength={2000}
        />

        <div className="mt-1 text-xs text-gray-500">{content.trim().length}/2000</div>

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              if (!content.trim()) {
                setError('Post content is required.');
                return;
              }

              try {
                await onSubmit(type, content);
                setContent('');
                setType('WIN');
                onClose();
              } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : 'Failed to create post');
              }
            }}
            className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:bg-gray-400"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

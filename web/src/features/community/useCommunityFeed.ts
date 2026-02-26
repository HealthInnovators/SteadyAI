'use client';

import { createApiClient } from '@/lib/api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createCommunityPost, deleteReaction, getCommunityFeed, upsertReaction } from './api';
import type { CommunityPost, PostType, ReactionType } from './types';

const POLL_INTERVAL_MS = 20000;

interface UseCommunityFeedOptions {
  token: string | null;
  enabled: boolean;
}

interface CommunityFeedState {
  posts: CommunityPost[];
  groupId: string | null;
  activeChallengeId: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: CommunityFeedState = {
  posts: [],
  groupId: null,
  activeChallengeId: null,
  isLoading: true,
  isRefreshing: false,
  isCreating: false,
  error: null
};

export function useCommunityFeed({ token, enabled }: UseCommunityFeedOptions) {
  const [state, setState] = useState<CommunityFeedState>(initialState);
  const currentUserId = useMemo(() => extractUserId(token), [token]);

  const api = useMemo(() => createApiClient(() => token || undefined), [token]);

  const refresh = useCallback(
    async (mode: 'initial' | 'poll' | 'manual' = 'manual') => {
      if (!enabled) {
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: mode === 'initial' && prev.posts.length === 0,
        isRefreshing: mode !== 'initial',
        error: null
      }));

      try {
        const response = await getCommunityFeed(api, 30);
        setState((prev) => ({
          ...prev,
          posts: response.items,
          groupId: response.groupId,
          activeChallengeId: response.activeChallengeId,
          isLoading: false,
          isRefreshing: false,
          error: null
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: error instanceof Error ? error.message : 'Failed to load feed'
        }));
      }
    },
    [api, enabled]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void refresh('initial');
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const id = window.setInterval(() => {
      void refresh('poll');
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [enabled, refresh]);

  const createPost = useCallback(
    async (type: PostType, content: string) => {
      const normalized = content.trim();
      if (!normalized) {
        throw new Error('Post content is required.');
      }

      setState((prev) => ({ ...prev, isCreating: true, error: null }));
      try {
        const created = await createCommunityPost(api, { type, content: normalized });
        setState((prev) => ({
          ...prev,
          isCreating: false,
          posts: [created, ...prev.posts.filter((item) => item.id !== created.id)]
        }));
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create post';
        setState((prev) => ({ ...prev, isCreating: false, error: message }));
        throw error;
      }
    },
    [api]
  );

  const toggleReaction = useCallback(
    async (postId: string, type: ReactionType) => {
      if (!currentUserId) {
        setState((prev) => ({ ...prev, error: 'Could not determine current user for reaction.' }));
        return;
      }

      const previousPosts = state.posts;
      const post = previousPosts.find((item) => item.id === postId);
      if (!post) {
        return;
      }

      const existing = post.reactions.find((reaction) => reaction.userId === currentUserId);
      const shouldRemove = existing?.type === type;

      const optimisticPosts = previousPosts.map((item) => {
        if (item.id !== postId) {
          return item;
        }

        const reactionsWithoutMine = item.reactions.filter((reaction) => reaction.userId !== currentUserId);

        if (shouldRemove) {
          return { ...item, reactions: reactionsWithoutMine };
        }

        return {
          ...item,
          reactions: [
            ...reactionsWithoutMine,
            {
              id: existing?.id || `local-${postId}-${currentUserId}`,
              userId: currentUserId,
              type,
              createdAt: new Date().toISOString()
            }
          ]
        };
      });

      setState((prev) => ({ ...prev, posts: optimisticPosts, error: null }));

      try {
        if (shouldRemove) {
          await deleteReaction(api, postId);
        } else {
          await upsertReaction(api, postId, type);
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          posts: previousPosts,
          error: error instanceof Error ? error.message : 'Failed to update reaction'
        }));
      }
    },
    [api, currentUserId, state.posts]
  );

  return {
    ...state,
    currentUserId,
    refresh,
    createPost,
    toggleReaction
  };
}

function extractUserId(token: string | null): string | null {
  if (!token) {
    return null;
  }

  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) {
      return null;
    }

    const payload = JSON.parse(atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))) as {
      sub?: string;
      userId?: string;
      uid?: string;
    };

    return payload.sub || payload.userId || payload.uid || null;
  } catch {
    return null;
  }
}

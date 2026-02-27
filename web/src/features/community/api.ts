import { ApiClient } from '@/lib/api';
import type { CommunityFeedResponse, CommunityPost, CreatePostInput, ReactionType } from './types';

export function getCommunityFeed(api: ApiClient, limit = 20): Promise<CommunityFeedResponse> {
  return api.get<CommunityFeedResponse>('/api/community/feed', {
    query: { limit }
  });
}

export function createCommunityPost(api: ApiClient, input: CreatePostInput): Promise<CommunityPost> {
  return api.post<CommunityPost, CreatePostInput>('/api/community/posts', {
    body: input
  });
}

export function upsertReaction(api: ApiClient, postId: string, type: ReactionType): Promise<void> {
  return api.post<void, { type: ReactionType }>(`/api/community/posts/${postId}/reactions`, {
    body: { type }
  });
}

export function deleteReaction(api: ApiClient, postId: string): Promise<void> {
  return api.delete<void>(`/api/community/posts/${postId}/reactions`);
}

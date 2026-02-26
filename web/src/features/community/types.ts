export type PostType = 'WIN' | 'QUESTION' | 'CHECK_IN';
export type ReactionType = 'LIKE' | 'CELEBRATE' | 'SUPPORT';

export interface CommunityAuthor {
  id: string;
  username: string;
  displayName?: string | null;
}

export interface CommunityReaction {
  id: string;
  type: ReactionType;
  userId: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  type?: PostType;
  content: string;
  createdAt: string;
  author: CommunityAuthor;
  reactions: CommunityReaction[];
}

export interface CommunityFeedResponse {
  groupId: string | null;
  activeChallengeId: string | null;
  items: CommunityPost[];
  nextCursor?: {
    createdAt: string;
    id: string;
  } | null;
}

export interface CreatePostInput {
  type: PostType;
  content: string;
}

export interface UpsertReactionInput {
  type: ReactionType;
}

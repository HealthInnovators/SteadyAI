import { ChallengeStatus, PostType, ReactionType } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';

export interface CreateCommunityPostInput {
  userId: string;
  type: PostType;
  content: string;
}

export interface CreateCommunityReactionInput {
  userId: string;
  postId: string;
  type?: ReactionType;
}

export const ALLOWED_POST_TYPES = new Set<PostType>([PostType.WIN, PostType.QUESTION, PostType.CHECK_IN]);
export const ALLOWED_REACTION_TYPES = new Set<ReactionType>([ReactionType.LIKE, ReactionType.CELEBRATE, ReactionType.SUPPORT]);

function normalizeContent(content: string): string {
  return content.replace(/\s+/g, ' ').trim();
}

async function resolveMembershipScope(userId: string): Promise<{ groupId: string; challengeId: string | null } | null> {
  const prisma = getPrismaClient();

  const membership = await prisma.challengeParticipation.findFirst({
    where: {
      userId,
      challenge: {
        status: ChallengeStatus.ACTIVE
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      challengeId: true,
      challenge: {
        select: {
          groupId: true
        }
      }
    }
  });

  if (!membership) {
    return null;
  }

  return {
    groupId: membership.challenge.groupId,
    challengeId: membership.challengeId
  };
}

export async function createCommunityPost(input: CreateCommunityPostInput) {
  const prisma = getPrismaClient();

  if (!ALLOWED_POST_TYPES.has(input.type)) {
    throw new Error('Invalid post type');
  }

  const content = normalizeContent(input.content);
  if (!content) {
    throw new Error('content is required');
  }

  if (content.length > 2000) {
    throw new Error('content exceeds 2000 characters');
  }

  const membershipScope = await resolveMembershipScope(input.userId);
  if (!membershipScope) {
    throw new Error('User is not an active member of a community challenge');
  }

  const createdPost = await prisma.post.create({
    data: {
      authorId: input.userId,
      groupId: membershipScope.groupId,
      challengeId: membershipScope.challengeId,
      type: input.type,
      content
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true
        }
      },
      group: {
        select: {
          id: true,
          name: true
        }
      },
      challenge: {
        select: {
          id: true,
          title: true
        }
      },
      reactions: {
        select: {
          id: true,
          type: true,
          userId: true,
          createdAt: true
        }
      }
    }
  });

  return createdPost;
}

export async function createCommunityReaction(input: CreateCommunityReactionInput) {
  const prisma = getPrismaClient();
  const reactionType = input.type ?? ReactionType.LIKE;

  if (!ALLOWED_REACTION_TYPES.has(reactionType)) {
    throw new Error('Invalid reaction type');
  }

  const membershipScope = await resolveMembershipScope(input.userId);
  if (!membershipScope) {
    throw new Error('User is not an active member of a community challenge');
  }

  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    select: {
      id: true,
      groupId: true
    }
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.groupId !== membershipScope.groupId) {
    throw new Error('Cannot react to posts outside your community group');
  }

  await prisma.reaction.upsert({
    where: {
      postId_userId: {
        postId: input.postId,
        userId: input.userId
      }
    },
    create: {
      postId: input.postId,
      userId: input.userId,
      type: reactionType
    },
    update: {
      type: reactionType
    }
  });

  const updatedPost = await prisma.post.findUniqueOrThrow({
    where: { id: input.postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true
        }
      },
      group: {
        select: {
          id: true,
          name: true
        }
      },
      challenge: {
        select: {
          id: true,
          title: true
        }
      },
      reactions: {
        select: {
          id: true,
          type: true,
          userId: true,
          createdAt: true
        }
      }
    }
  });

  return updatedPost;
}

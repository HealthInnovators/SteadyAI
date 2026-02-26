import { ChallengeStatus, PostType } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';

export interface CreateCommunityPostInput {
  userId: string;
  type: PostType;
  content: string;
}

export const ALLOWED_POST_TYPES = new Set<PostType>([PostType.WIN, PostType.QUESTION, PostType.CHECK_IN]);

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

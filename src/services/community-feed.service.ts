import { ChallengeStatus } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';

export interface CommunityFeedInput {
  userId: string;
  limit?: number;
  cursorCreatedAt?: string;
  cursorId?: string;
}

interface FeedPost {
  id: string;
  type?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    displayName: string | null;
  };
  group: {
    id: string;
    name: string;
  } | null;
  challenge: {
    id: string;
    title: string;
  } | null;
  reactions: Array<{
    id: string;
    type: string;
    userId: string;
    createdAt: Date;
  }>;
}

export interface CommunityFeedResult {
  groupId: string | null;
  activeChallengeId: string | null;
  items: FeedPost[];
  nextCursor: {
    createdAt: string;
    id: string;
  } | null;
}

function normalizeLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit)) {
    return 20;
  }

  return Math.min(Math.max(limit, 1), 50);
}

async function resolveUserScope(userId: string): Promise<{ groupId: string | null; activeChallengeId: string | null }> {
  const prisma = getPrismaClient();

  const activeParticipation = await prisma.challengeParticipation.findFirst({
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
      challenge: {
        select: {
          id: true,
          groupId: true
        }
      }
    }
  });

  return {
    groupId: activeParticipation?.challenge.groupId ?? null,
    activeChallengeId: activeParticipation?.challenge.id ?? null
  };
}

export async function getCommunityFeed(input: CommunityFeedInput): Promise<CommunityFeedResult> {
  const prisma = getPrismaClient();
  const limit = normalizeLimit(input.limit);
  const scope = await resolveUserScope(input.userId);

  if (!scope.groupId) {
    return {
      groupId: null,
      activeChallengeId: null,
      items: [],
      nextCursor: null
    };
  }

  const cursorDate = input.cursorCreatedAt ? new Date(input.cursorCreatedAt) : null;
  const hasCursor = Boolean(cursorDate && !Number.isNaN(cursorDate.getTime()) && input.cursorId);

  const posts = await prisma.post.findMany({
    where: {
      groupId: scope.groupId,
      OR: [{ challengeId: scope.activeChallengeId }, { challengeId: null }],
      ...(hasCursor
        ? {
            OR: [
              { createdAt: { lt: cursorDate as Date } },
              {
                createdAt: cursorDate as Date,
                id: { lt: input.cursorId as string }
              }
            ]
          }
        : {})
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
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const lastItem = items[items.length - 1];

  return {
    groupId: scope.groupId,
    activeChallengeId: scope.activeChallengeId,
    items,
    nextCursor:
      hasMore && lastItem
        ? {
            createdAt: lastItem.createdAt.toISOString(),
            id: lastItem.id
          }
        : null
  };
}

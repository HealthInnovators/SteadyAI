import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { ChallengeStatus, PostType } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';

const DEFAULT_WINDOW_HOURS = 24;
const MAX_WINDOW_HOURS = 24 * 7;
const DEFAULT_SAVE_DIR = '/tmp/community-summaries';

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'this',
  'that',
  'from',
  'have',
  'your',
  'just',
  'today',
  'into',
  'about',
  'after',
  'before',
  'been',
  'were',
  'they',
  'them',
  'then',
  'than',
  'over',
  'under',
  'what',
  'when',
  'where',
  'which',
  'will',
  'would',
  'could',
  'should',
  'done',
  'does',
  'did',
  'got',
  'get',
  'had',
  'has',
  'was',
  'are',
  'our'
]);

interface SummaryScope {
  groupId: string | null;
  activeChallengeId: string | null;
}

interface GenerateCommunityDailySummaryInput {
  userId: string;
  sinceHours?: number;
  save?: boolean;
  saveDir?: string;
}

export interface CommunityDailySummaryResult {
  summary: {
    generatedAt: string;
    window: {
      from: string;
      to: string;
      hours: number;
    };
    scope: SummaryScope;
    totals: {
      posts: number;
      reactions: number;
      uniqueAuthors: number;
    };
    wins: {
      count: number;
      highlights: Array<{
        id: string;
        author: string;
        createdAt: string;
        reactions: number;
        content: string;
      }>;
    };
    questions: {
      count: number;
      unansweredCount: number;
      openQuestions: Array<{
        id: string;
        author: string;
        createdAt: string;
        reactions: number;
        content: string;
      }>;
    };
    trends: {
      topKeywords: Array<{ keyword: string; count: number }>;
      postTypes: Array<{ type: string; count: number }>;
    };
    engagement: {
      averageReactionsPerPost: number;
      mostActiveAuthors: Array<{
        authorId: string;
        author: string;
        posts: number;
        reactionsReceived: number;
      }>;
    };
  };
  savedPath: string | null;
}

function normalizeHours(hours?: number): number {
  if (!hours || Number.isNaN(hours)) {
    return DEFAULT_WINDOW_HOURS;
  }

  return Math.min(Math.max(Math.floor(hours), 1), MAX_WINDOW_HOURS);
}

function toPreview(content: string, max = 160): string {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) {
    return normalized;
  }

  return `${normalized.slice(0, max - 1)}...`;
}

function tokenize(content: string): string[] {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

async function resolveSummaryScope(userId: string): Promise<SummaryScope> {
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

async function persistSummary(summary: unknown, groupId: string, now: Date, saveDir?: string): Promise<string> {
  const directory = saveDir || DEFAULT_SAVE_DIR;
  await mkdir(directory, { recursive: true });

  const safeGroupId = groupId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const filename = `daily-summary-${safeGroupId}-${now.toISOString().replace(/[:.]/g, '-')}.json`;
  const outputPath = path.join(directory, filename);

  await writeFile(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
  return outputPath;
}

export async function generateCommunityDailySummary(
  input: GenerateCommunityDailySummaryInput
): Promise<CommunityDailySummaryResult> {
  const prisma = getPrismaClient();
  const hours = normalizeHours(input.sinceHours);
  const now = new Date();
  const from = new Date(now.getTime() - hours * 60 * 60 * 1000);
  const scope = await resolveSummaryScope(input.userId);

  if (!scope.groupId) {
    return {
      summary: {
        generatedAt: now.toISOString(),
        window: {
          from: from.toISOString(),
          to: now.toISOString(),
          hours
        },
        scope,
        totals: {
          posts: 0,
          reactions: 0,
          uniqueAuthors: 0
        },
        wins: {
          count: 0,
          highlights: []
        },
        questions: {
          count: 0,
          unansweredCount: 0,
          openQuestions: []
        },
        trends: {
          topKeywords: [],
          postTypes: []
        },
        engagement: {
          averageReactionsPerPost: 0,
          mostActiveAuthors: []
        }
      },
      savedPath: null
    };
  }

  const posts = await prisma.post.findMany({
    where: {
      groupId: scope.groupId,
      createdAt: {
        gte: from,
        lte: now
      },
      OR: [{ challengeId: scope.activeChallengeId }, { challengeId: null }]
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true
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

  const totalReactions = posts.reduce((sum, post) => sum + post.reactions.length, 0);
  const uniqueAuthors = new Set(posts.map((post) => post.authorId)).size;

  const wins = posts.filter((post) => post.type === PostType.WIN);
  const questions = posts.filter((post) => post.type === PostType.QUESTION);

  const keywordCounts = new Map<string, number>();
  const postTypeCounts = new Map<string, number>();
  const authorStats = new Map<string, { author: string; posts: number; reactionsReceived: number }>();

  for (const post of posts) {
    postTypeCounts.set(post.type, (postTypeCounts.get(post.type) ?? 0) + 1);

    const authorLabel = post.author.displayName || post.author.username;
    const previous = authorStats.get(post.authorId) ?? { author: authorLabel, posts: 0, reactionsReceived: 0 };
    authorStats.set(post.authorId, {
      author: authorLabel,
      posts: previous.posts + 1,
      reactionsReceived: previous.reactionsReceived + post.reactions.length
    });

    for (const token of tokenize(post.content)) {
      keywordCounts.set(token, (keywordCounts.get(token) ?? 0) + 1);
    }
  }

  const winsHighlights = [...wins]
    .sort((a, b) => b.reactions.length - a.reactions.length || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      author: post.author.displayName || post.author.username,
      createdAt: post.createdAt.toISOString(),
      reactions: post.reactions.length,
      content: toPreview(post.content)
    }));

  const openQuestions = [...questions]
    .sort((a, b) => a.reactions.length - b.reactions.length || b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      author: post.author.displayName || post.author.username,
      createdAt: post.createdAt.toISOString(),
      reactions: post.reactions.length,
      content: toPreview(post.content)
    }));

  const topKeywords = [...keywordCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));

  const postTypes = [...postTypeCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([type, count]) => ({ type, count }));

  const mostActiveAuthors = [...authorStats.entries()]
    .sort((a, b) => b[1].posts - a[1].posts || b[1].reactionsReceived - a[1].reactionsReceived)
    .slice(0, 5)
    .map(([authorId, stats]) => ({
      authorId,
      author: stats.author,
      posts: stats.posts,
      reactionsReceived: stats.reactionsReceived
    }));

  const summary = {
    generatedAt: now.toISOString(),
    window: {
      from: from.toISOString(),
      to: now.toISOString(),
      hours
    },
    scope,
    totals: {
      posts: posts.length,
      reactions: totalReactions,
      uniqueAuthors
    },
    wins: {
      count: wins.length,
      highlights: winsHighlights
    },
    questions: {
      count: questions.length,
      unansweredCount: questions.filter((post) => post.reactions.length === 0).length,
      openQuestions
    },
    trends: {
      topKeywords,
      postTypes
    },
    engagement: {
      averageReactionsPerPost: posts.length === 0 ? 0 : Number((totalReactions / posts.length).toFixed(2)),
      mostActiveAuthors
    }
  };

  const savedPath = input.save ? await persistSummary(summary, scope.groupId, now, input.saveDir) : null;

  return {
    summary,
    savedPath
  };
}

import { ChallengeStatus, ParticipationStatus } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

interface EnrollUserInChallengeInput {
  userId: string;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function resolveOrCreateDefaultActiveChallenge(userId: string): Promise<{ id: string; groupId: string }> {
  const prisma = getPrismaClient();

  const existingActiveChallenge = await prisma.challenge.findFirst({
    where: { status: ChallengeStatus.ACTIVE },
    select: {
      id: true,
      groupId: true
    },
    orderBy: { createdAt: 'asc' }
  });

  if (existingActiveChallenge) {
    return existingActiveChallenge;
  }

  const defaultGroup =
    (await prisma.communityGroup.findFirst({
      where: { name: 'General Challenges' },
      select: { id: true }
    })) ??
    (await prisma.communityGroup.create({
      data: {
        name: 'General Challenges',
        description: 'Default group for challenge enrollment.',
        ownerId: userId
      },
      select: { id: true }
    }));

  const now = new Date();
  const startsAt = startOfUtcDay(now);
  const endsAt = new Date(startsAt.getTime() + THIRTY_DAYS_IN_MS);

  const challenge = await prisma.challenge.create({
    data: {
      groupId: defaultGroup.id,
      creatorId: userId,
      title: 'Starter 30-Day Challenge',
      description: 'Default challenge created during enrollment.',
      dailyTaskDescription: 'Complete one action toward your goal and check in.',
      startsAt,
      endsAt,
      status: ChallengeStatus.ACTIVE
    },
    select: {
      id: true,
      groupId: true
    }
  });

  return challenge;
}

export async function enrollUserInChallenge(input: EnrollUserInChallengeInput) {
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const challenge = await resolveOrCreateDefaultActiveChallenge(user.id);

  const participation = await prisma.challengeParticipation.upsert({
    where: {
      challengeId_userId: {
        challengeId: challenge.id,
        userId: user.id
      }
    },
    create: {
      challengeId: challenge.id,
      userId: user.id,
      status: ParticipationStatus.JOINED
    },
    update: {
      challengeId: challenge.id,
      status: ParticipationStatus.JOINED
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return {
    userId: user.id,
    enrolled: true,
    challengeId: challenge.id,
    groupId: challenge.groupId,
    participation
  };
}

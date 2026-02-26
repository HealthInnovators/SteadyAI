import { DailyParticipationStatus, Prisma } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';

export const ALLOWED_DAILY_STATUSES = new Set<DailyParticipationStatus>([
  DailyParticipationStatus.COMPLETED,
  DailyParticipationStatus.PARTIAL,
  DailyParticipationStatus.SKIPPED
]);

export interface CreateDailyCheckInInput {
  userId: string;
  status: DailyParticipationStatus;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function resolveActiveParticipation(userId: string) {
  const prisma = getPrismaClient();

  const participation = await prisma.challengeParticipation.findFirst({
    where: {
      userId,
      status: 'JOINED',
      challenge: {
        status: 'ACTIVE'
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    select: {
      id: true,
      challengeId: true,
      status: true
    }
  });

  return participation;
}

export async function createDailyChallengeCheckIn(input: CreateDailyCheckInInput) {
  const prisma = getPrismaClient();

  if (!ALLOWED_DAILY_STATUSES.has(input.status)) {
    throw new Error('Invalid status value');
  }

  const participation = await resolveActiveParticipation(input.userId);
  if (!participation) {
    throw new Error('No active challenge participation found');
  }

  const checkInDate = startOfUtcDay(new Date());

  const existing = await prisma.challengeCheckIn.findUnique({
    where: {
      participationId_checkInDate: {
        participationId: participation.id,
        checkInDate
      }
    },
    select: {
      id: true,
      participationStatus: true,
      checkInDate: true
    }
  });

  if (existing) {
    throw new Error('Check-in already submitted for today');
  }

  try {
    await prisma.challengeCheckIn.create({
      data: {
        challengeId: participation.challengeId,
        participationId: participation.id,
        checkInDate,
        participationStatus: input.status
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('Check-in already submitted for today');
    }
    throw error;
  }

  const [totalCheckIns, completedCount, partialCount, skippedCount, latestCheckIn] = await Promise.all([
    prisma.challengeCheckIn.count({
      where: {
        participationId: participation.id
      }
    }),
    prisma.challengeCheckIn.count({
      where: {
        participationId: participation.id,
        participationStatus: DailyParticipationStatus.COMPLETED
      }
    }),
    prisma.challengeCheckIn.count({
      where: {
        participationId: participation.id,
        participationStatus: DailyParticipationStatus.PARTIAL
      }
    }),
    prisma.challengeCheckIn.count({
      where: {
        participationId: participation.id,
        participationStatus: DailyParticipationStatus.SKIPPED
      }
    }),
    prisma.challengeCheckIn.findFirst({
      where: {
        participationId: participation.id
      },
      orderBy: {
        checkInDate: 'desc'
      },
      select: {
        checkInDate: true,
        participationStatus: true
      }
    })
  ]);

  return {
    participationId: participation.id,
    challengeId: participation.challengeId,
    participationStatus: participation.status,
    latestCheckIn: latestCheckIn
      ? {
          date: latestCheckIn.checkInDate.toISOString(),
          status: latestCheckIn.participationStatus
        }
      : null,
    counts: {
      total: totalCheckIns,
      completed: completedCount,
      partial: partialCount,
      skipped: skippedCount
    }
  };
}

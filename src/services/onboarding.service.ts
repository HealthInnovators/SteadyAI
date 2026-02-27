import { ChallengeStatus, ParticipationStatus } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';

export interface CompleteOnboardingInput {
  userId: string;
  email?: string;
  primaryGoal: string;
  experienceLevel: string;
  dietaryPreferences: string[];
  timeAvailability: string;
}

interface GroupRule {
  name: string;
  description: string;
}

interface AssignmentResult {
  communityGroupId: string;
  challengeId: string;
}

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

function buildUsername(userId: string, email?: string): string {
  const base = (email?.split('@')[0] ?? 'user').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  return `${base}_${userId.replace(/-/g, '').slice(0, 8)}`;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function hasAny(text: string, tokens: string[]): boolean {
  return tokens.some((token) => text.includes(token));
}

function hasPlantBasedPreference(preferences: string[]): boolean {
  return preferences.some((item) => {
    const normalized = normalizeText(item);
    return hasAny(normalized, ['vegan', 'vegetarian', 'plant']);
  });
}

function hasLimitedTime(timeAvailability: string): boolean {
  const normalized = normalizeText(timeAvailability);
  if (hasAny(normalized, ['busy', 'short', 'limited'])) {
    return true;
  }

  const firstNumber = normalized.match(/\d+/)?.[0];
  if (!firstNumber) {
    return false;
  }

  return Number(firstNumber) <= 30;
}

function resolveGroupRule(input: CompleteOnboardingInput): GroupRule {
  const primaryGoal = normalizeText(input.primaryGoal);
  const experienceLevel = normalizeText(input.experienceLevel);

  if (hasAny(primaryGoal, ['strength', 'muscle', 'performance'])) {
    return {
      name: 'Strength Builders',
      description: 'Focused on progressive strength and performance habits.'
    };
  }

  if (hasAny(primaryGoal, ['weight', 'fat', 'lose'])) {
    return {
      name: 'Fat Loss Circle',
      description: 'Focused on sustainable fat-loss and consistency.'
    };
  }

  if (hasPlantBasedPreference(input.dietaryPreferences)) {
    return {
      name: 'Plant Powered Crew',
      description: 'Plant-based members sharing practical training and meal habits.'
    };
  }

  if (hasAny(experienceLevel, ['beginner', 'new'])) {
    return {
      name: 'Foundations Crew',
      description: 'Beginner-friendly accountability for building core routines.'
    };
  }

  if (hasLimitedTime(input.timeAvailability)) {
    return {
      name: 'Busy Momentum',
      description: 'Short, high-consistency habits for busy schedules.'
    };
  }

  return {
    name: 'Consistency Club',
    description: 'General wellness group focused on daily consistency.'
  };
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function buildChallengeDescription(input: CompleteOnboardingInput): string {
  return [
    '30-day guided challenge tailored from onboarding.',
    `Primary goal: ${input.primaryGoal}.`,
    `Experience: ${input.experienceLevel}.`,
    `Time availability: ${input.timeAvailability}.`
  ].join(' ');
}

async function assignCommunityAndChallenge(userId: string, input: CompleteOnboardingInput): Promise<AssignmentResult> {
  const prisma = getPrismaClient();
  const groupRule = resolveGroupRule(input);

  const communityGroup =
    (await prisma.communityGroup.findFirst({
      where: { name: groupRule.name },
      orderBy: { createdAt: 'asc' }
    })) ??
    (await prisma.communityGroup.create({
      data: {
        name: groupRule.name,
        description: groupRule.description,
        ownerId: userId
      }
    }));

  const now = new Date();
  const activeChallenge = await prisma.challenge.findFirst({
    where: {
      groupId: communityGroup.id,
      status: ChallengeStatus.ACTIVE,
      OR: [{ endsAt: null }, { endsAt: { gte: now } }]
    },
    orderBy: { createdAt: 'desc' }
  });

  const challenge =
    activeChallenge ??
    (await prisma.challenge.create({
      data: {
        groupId: communityGroup.id,
        creatorId: userId,
        title: `${groupRule.name} 30-Day Challenge`,
        description: buildChallengeDescription(input),
        dailyTaskDescription: 'Complete your daily plan and log your progress.',
        startsAt: startOfUtcDay(now),
        endsAt: new Date(startOfUtcDay(now).getTime() + THIRTY_DAYS_IN_MS),
        status: ChallengeStatus.ACTIVE
      }
    }));

  await prisma.challengeParticipation.upsert({
    where: { userId },
    create: {
      challengeId: challenge.id,
      userId,
      status: ParticipationStatus.JOINED
    },
    update: {
      challengeId: challenge.id,
      status: ParticipationStatus.JOINED
    }
  });

  return {
    communityGroupId: communityGroup.id,
    challengeId: challenge.id
  };
}

export async function completeOnboarding(input: CompleteOnboardingInput) {
  const prisma = getPrismaClient();

  await prisma.user.upsert({
    where: { id: input.userId },
    create: {
      id: input.userId,
      email: input.email ?? `${input.userId}@pending.local`,
      username: buildUsername(input.userId, input.email),
      primaryGoal: input.primaryGoal,
      experienceLevel: input.experienceLevel,
      dietaryPreferences: input.dietaryPreferences,
      timeAvailability: input.timeAvailability,
      onboardingCompleted: true
    },
    update: {
      primaryGoal: input.primaryGoal,
      experienceLevel: input.experienceLevel,
      dietaryPreferences: input.dietaryPreferences,
      timeAvailability: input.timeAvailability,
      onboardingCompleted: true
    }
  });

  const assignment = await assignCommunityAndChallenge(input.userId, input);

  const profile = await prisma.user.findUniqueOrThrow({
    where: { id: input.userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      primaryGoal: true,
      experienceLevel: true,
      dietaryPreferences: true,
      timeAvailability: true,
      onboardingCompleted: true,
      createdAt: true,
      updatedAt: true,
      participations: {
        where: {
          challengeId: assignment.challengeId,
          status: ParticipationStatus.JOINED
        },
        take: 1,
        select: {
          id: true,
          status: true,
          createdAt: true,
          challenge: {
            select: {
              id: true,
              title: true,
              description: true,
              dailyTaskDescription: true,
              startsAt: true,
              endsAt: true,
              status: true,
              group: {
                select: {
                  id: true,
                  name: true,
                  description: true
                }
              }
            }
          }
        }
      }
    }
  });

  const participation = profile.participations[0] ?? null;

  return {
    ...profile,
    participation,
    assignedCommunityGroupId: assignment.communityGroupId,
    assignedChallengeId: assignment.challengeId
  };
}

import { ParticipationStatus } from '@prisma/client';

import { getPrismaClient } from '../db/prisma';

export interface CompleteOnboardingInput {
  userId: string;
  email?: string;
  primaryGoal: string;
  experienceLevel: string;
  dietaryPreferences: string[];
  timeAvailability: string;
}

interface AssignmentResult {
  communityGroupId: string | null;
  challengeId: string | null;
}

function buildUsername(userId: string, email?: string): string {
  const base = (email?.split('@')[0] ?? 'user').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  return `${base}_${userId.replace(/-/g, '').slice(0, 8)}`;
}

async function assignCommunityAndChallenge(userId: string): Promise<AssignmentResult> {
  const prisma = getPrismaClient();

  const communityGroup = await prisma.communityGroup.findFirst({
    orderBy: { createdAt: 'asc' }
  });

  if (!communityGroup) {
    return {
      communityGroupId: null,
      challengeId: null
    };
  }

  const challenge = await prisma.challenge.findFirst({
    where: {
      groupId: communityGroup.id,
      status: 'ACTIVE'
    },
    orderBy: { createdAt: 'asc' }
  });

  if (!challenge) {
    return {
      communityGroupId: communityGroup.id,
      challengeId: null
    };
  }

  await prisma.challengeParticipation.upsert({
    where: {
      challengeId_userId: {
        challengeId: challenge.id,
        userId
      }
    },
    create: {
      challengeId: challenge.id,
      userId,
      status: ParticipationStatus.JOINED
    },
    update: {}
  });

  return {
    communityGroupId: communityGroup.id,
    challengeId: challenge.id
  };
}

export async function completeOnboarding(input: CompleteOnboardingInput) {
  const prisma = getPrismaClient();

  const user = await prisma.user.upsert({
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
    },
    select: {
      id: true,
      email: true,
      username: true,
      primaryGoal: true,
      experienceLevel: true,
      dietaryPreferences: true,
      timeAvailability: true,
      onboardingCompleted: true,
      updatedAt: true
    }
  });

  const assignment = await assignCommunityAndChallenge(user.id);

  return {
    ...user,
    assignedCommunityGroupId: assignment.communityGroupId,
    assignedChallengeId: assignment.challengeId
  };
}

export interface McpUserProfileInput {
  userId: string;
  onboardingCompleted?: boolean;
  primaryGoal?: string | null;
  experienceLevel?: string | null;
  dietaryPreferences?: string[] | null;
  timeAvailability?: string | null;
}

export interface McpChallengeActivityInput {
  activeChallengeId?: string | null;
  participationStatus?: string | null;
  totalCheckIns?: number;
  completedCheckIns?: number;
  partialCheckIns?: number;
  skippedCheckIns?: number;
  lastCheckInAt?: string | null;
}

export interface McpCommunityEngagementInput {
  postsCount?: number;
  reactionsGivenCount?: number;
  reactionsReceivedCount?: number;
  lastPostAt?: string | null;
}

export interface McpPurchaseHistoryInput {
  totalPurchases?: number;
  totalSpentCents?: number;
  lastPurchaseAt?: string | null;
  topProductIds?: string[];
}

export interface BuildMcpUserSummaryInput {
  profile: McpUserProfileInput;
  challengeActivity?: McpChallengeActivityInput;
  communityEngagement?: McpCommunityEngagementInput;
  purchaseHistory?: McpPurchaseHistoryInput;
}

export interface McpUserSummary {
  schemaVersion: 'v1';
  generatedAt: string;
  userId: string;
  profile: {
    onboardingCompleted: boolean;
    primaryGoal: string | null;
    experienceLevel: string | null;
    dietaryPreferences: string[];
    timeAvailability: string | null;
  };
  challengeActivity: {
    activeChallengeId: string | null;
    participationStatus: string | null;
    checkIns: {
      total: number;
      completed: number;
      partial: number;
      skipped: number;
      completionRate: number;
      lastCheckInAt: string | null;
    };
  };
  communityEngagement: {
    postsCount: number;
    reactionsGivenCount: number;
    reactionsReceivedCount: number;
    lastPostAt: string | null;
  };
  purchaseHistory: {
    totalPurchases: number;
    totalSpentCents: number;
    averageOrderValueCents: number;
    lastPurchaseAt: string | null;
    topProductIds: string[];
  };
  safety: {
    piiIncluded: false;
    rawHealthDataIncluded: false;
  };
}

function safeText(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 0 ? normalized : null;
}

function safeArray(values: string[] | null | undefined): string[] {
  if (!values || values.length === 0) {
    return [];
  }

  return values
    .map((v) => v.replace(/\s+/g, ' ').trim().toLowerCase())
    .filter((v) => v.length > 0)
    .slice(0, 20)
    .sort();
}

function safeCount(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
}

function safeMoneyCents(value: number | null | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.round(value));
}

function safeIso(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }
  return Number((numerator / denominator).toFixed(4));
}

export function buildMcpUserSummary(input: BuildMcpUserSummaryInput): McpUserSummary {
  const totalCheckIns = safeCount(input.challengeActivity?.totalCheckIns);
  const completedCheckIns = safeCount(input.challengeActivity?.completedCheckIns);
  const partialCheckIns = safeCount(input.challengeActivity?.partialCheckIns);
  const skippedCheckIns = safeCount(input.challengeActivity?.skippedCheckIns);

  const totalPurchases = safeCount(input.purchaseHistory?.totalPurchases);
  const totalSpentCents = safeMoneyCents(input.purchaseHistory?.totalSpentCents);

  return {
    schemaVersion: 'v1',
    generatedAt: new Date().toISOString(),
    userId: input.profile.userId,
    profile: {
      onboardingCompleted: Boolean(input.profile.onboardingCompleted),
      primaryGoal: safeText(input.profile.primaryGoal),
      experienceLevel: safeText(input.profile.experienceLevel),
      dietaryPreferences: safeArray(input.profile.dietaryPreferences),
      timeAvailability: safeText(input.profile.timeAvailability)
    },
    challengeActivity: {
      activeChallengeId: safeText(input.challengeActivity?.activeChallengeId),
      participationStatus: safeText(input.challengeActivity?.participationStatus),
      checkIns: {
        total: totalCheckIns,
        completed: completedCheckIns,
        partial: partialCheckIns,
        skipped: skippedCheckIns,
        completionRate: safeRate(completedCheckIns, totalCheckIns),
        lastCheckInAt: safeIso(input.challengeActivity?.lastCheckInAt)
      }
    },
    communityEngagement: {
      postsCount: safeCount(input.communityEngagement?.postsCount),
      reactionsGivenCount: safeCount(input.communityEngagement?.reactionsGivenCount),
      reactionsReceivedCount: safeCount(input.communityEngagement?.reactionsReceivedCount),
      lastPostAt: safeIso(input.communityEngagement?.lastPostAt)
    },
    purchaseHistory: {
      totalPurchases,
      totalSpentCents,
      averageOrderValueCents: totalPurchases > 0 ? Math.round(totalSpentCents / totalPurchases) : 0,
      lastPurchaseAt: safeIso(input.purchaseHistory?.lastPurchaseAt),
      topProductIds: (input.purchaseHistory?.topProductIds ?? []).filter(Boolean).slice(0, 10)
    },
    safety: {
      piiIncluded: false,
      rawHealthDataIncluded: false
    }
  };
}

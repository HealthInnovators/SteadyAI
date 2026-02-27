export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  whoItsFor: string;
  whoItsNotFor: string;
}

export interface StoreProductsResponse {
  items: StoreProduct[];
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

export interface OptionalProductSuggestion {
  productId: string;
  name: string;
  explanation: string;
  relevanceScore: number;
}

export interface OptionalProductSuggestionResponse {
  optional: true;
  shouldShowSuggestions: boolean;
  presentation: 'passive_optional';
  suggestions: OptionalProductSuggestion[];
  rationale: string;
}

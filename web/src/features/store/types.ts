export interface StoreProduct {
  id: string;
  name: string;
  description: string;
  priceCents?: number;
  currency?: string;
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

export interface CoachFeedbackRequestItem {
  id: string;
  topic: string;
  context: string | null;
  preferredOutcome: string | null;
  status: 'REQUESTED' | 'IN_REVIEW' | 'RESPONDED' | 'CLOSED';
  coachReply: string | null;
  respondedAt: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
  };
}

export interface CoachFeedbackListResponse {
  items: CoachFeedbackRequestItem[];
}

export interface CreateCoachFeedbackRequestInput {
  productId: string;
  topic: string;
  context?: string;
  preferredOutcome?: string;
}

export interface CreateCoachFeedbackRequestResponse {
  message: string;
  request: CoachFeedbackRequestItem;
  purchase: {
    id: string;
    totalCents: number;
    purchasedAt: string;
  };
}

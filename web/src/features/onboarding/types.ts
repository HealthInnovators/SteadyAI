export interface OnboardingDraft {
  primaryGoal: string;
  experienceLevel: string;
  dietaryPreferences: string[];
  timeAvailability: string;
}

export interface OnboardingPayload {
  primaryGoal: string;
  experienceLevel: string;
  dietaryPreferences: string[];
  timeAvailability: string;
}

export interface OnboardingResponse {
  userId?: string;
  onboardingCompleted?: boolean;
  [key: string]: unknown;
}

export interface UserOnboardingProfileInput {
  primaryGoal?: string | null;
  experienceLevel?: string | null;
  dietaryPreferences?: string[] | null;
  timeAvailability?: string | null;
}

function normalizeText(value: string | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const collapsed = value.replace(/\s+/g, ' ').trim();
  if (!collapsed) {
    return fallback;
  }

  return collapsed;
}

function normalizePreferences(preferences: string[] | null | undefined): string {
  if (!preferences || preferences.length === 0) {
    return 'none specified';
  }

  const cleaned = preferences
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter((item) => item.length > 0)
    .map((item) => item.toLowerCase())
    .sort();

  if (cleaned.length === 0) {
    return 'none specified';
  }

  return cleaned.join(', ');
}

export function generateUserStartingProfileSummary(input: UserOnboardingProfileInput): string {
  const primaryGoal = normalizeText(input.primaryGoal, 'not specified').toLowerCase();
  const experienceLevel = normalizeText(input.experienceLevel, 'not specified').toLowerCase();
  const timeAvailability = normalizeText(input.timeAvailability, 'not specified').toLowerCase();
  const dietaryPreferences = normalizePreferences(input.dietaryPreferences);

  return `Starting profile: primary goal is ${primaryGoal}; experience level is ${experienceLevel}; dietary preferences are ${dietaryPreferences}; time availability is ${timeAvailability}. This summary is for planning context only and does not include medical guidance or claims.`;
}

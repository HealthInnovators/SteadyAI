export type QueryValue = string | number | boolean | undefined | null;

export interface ApiClientOptions {
  baseUrl?: string;
  token?: string | (() => string | undefined | null);
  defaultHeaders?: HeadersInit;
}

export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  query?: Record<string, QueryValue>;
  headers?: HeadersInit;
}

export interface BodyRequestOptions<B> extends RequestOptions {
  body?: B;
}

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  detail?: string;
  [key: string]: unknown;
}

export enum UserRole {
    MEMBER = 'MEMBER',
    COACH = 'COACH',
    ADMIN = 'ADMIN',
}

export interface PlatformContext {
    userIdentity: {
      id: string;
      email: string | undefined;
      displayName: string | null | undefined;
      onboardingCompleted: boolean;
    };
    workspace: {
      id: string;
      name: string;
      role: UserRole;
    };
    enabledModules: string[];
}

export interface WorkoutPreferences {
  preferredDurationMinutes?: number | null;
  preferredImpact?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  equipment?: 'NONE' | 'HOME' | 'GYM' | null;
  autoPostCheckIn?: boolean;
  updatedAt?: string;
}

export interface WorkoutHistorySummary {
  windowDays: number;
  sessions: number;
  avgCompletionRate: number;
  avgDurationMinutes: number;
  lastFeedback: 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD' | null;
  streakDays: number;
}

export interface ExerciseMedia {
  id: string;
  normalizedName: string;
  displayName: string;
  thumbnailLabel: string | null;
  gifUrl: string | null;
  videoUrl: string | null;
  demoUrl: string | null;
}

export interface NutritionItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  calories: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}

export interface NutritionEntry {
  id: string;
  consumedAt: string;
  totalCalories: number | null;
  totalProteinG: number | null;
  totalCarbsG: number | null;
  totalFatG: number | null;
  items: NutritionItem[];
}

export interface TrendDataItem {
  date: string;
  label: string;
  value: number;
}

export interface ReportsOverview {
  period: {
    days: number;
    from: string;
    to: string;
  };
  challenge: {
    activeParticipation: boolean;
    totalCheckIns: number;
    completed: number;
    partial: number;
    skipped: number;
    completionRate: number;
    currentStreakDays: number;
  };
  nutrition: {
    entries: number;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    avgCaloriesPerEntry: number;
  };
  workout: {
    sessions: number;
    totalMinutes: number;
    avgMinutesPerSession: number;
    avgCompletionRate: number | null;
    feedback: {
      TOO_EASY: number;
      JUST_RIGHT: number;
      TOO_HARD: number;
    };
  };
  community: {
    posts: number;
    postTypes: {
      WIN: number;
      QUESTION: number;
      CHECK_IN: number;
    };
    reactionsGiven: number;
    reactionsReceived: number;
    repliesReceived: number;
  };
  trends: {
    days: number;
    checkInsCompleted: TrendDataItem[];
    calories: TrendDataItem[];
    workoutMinutes: TrendDataItem[];
    communityPosts: TrendDataItem[];
  };
}

export type ApiQueryValue = string | number | boolean | null | undefined;

export type RequestOptions = {
  token?: string | null;
  query?: Record<string, ApiQueryValue>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type ApiErrorPayload = {
  error?: string;
  message?: string;
  detail?: string;
  statusCode?: number;
  [key: string]: unknown;
};

export type AssistantIntent =
  | 'FITNESS'
  | 'NUTRITION'
  | 'TRACKING'
  | 'CHECK_IN'
  | 'COMMUNITY'
  | 'REPORTS'
  | 'STORE'
  | 'EDUCATION'
  | 'GENERAL';

export type AssistantCard = {
  id: string;
  type: 'summary' | 'reasoning' | 'next_steps';
  title: string;
  body?: string;
  items?: string[];
  actions?: Array<{ label: string; prompt: string }>;
};

export type WorkoutExercise = {
  name: string;
  durationMin: number;
  reps: string;
  thumbnailLabel?: string;
  mediaUrl?: string;
  mediaType?: 'GIF' | 'MP4' | 'IMAGE' | 'NONE';
  gifUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
  note: string;
};

export type WorkoutPlan = {
  planId: string;
  title: string;
  focus: string;
  estimatedTotalMin: number;
  exercises: WorkoutExercise[];
};

export type MealOption = {
  name: string;
  imageUrl: string;
  calories: number;
  proteinG: number;
  prepTimeMin: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
  note: string;
  youtubeSearchQuery?: string;
  videoUrls?: string[];
};

export type MealPlan = {
  planId: string;
  title: string;
  goal: string;
  options: MealOption[];
};

export type NutritionLog = {
  entryId: string;
  mealText: string;
  consumedAt: string;
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  todaySummary: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    entries: number;
  };
};

export type AssistantMessageResponse = {
  reply: string;
  text?: string;
  disclaimer?: string;
  routedTo?: string;
  intent?: AssistantIntent;
  toolInvocations?: string[];
  agentRunId?: string;
  workoutPlan?: WorkoutPlan;
  mealPlan?: MealPlan;
  nutritionLog?: NutritionLog;
  cards?: AssistantCard[];
};

export type WorkoutPreferences = {
  userId: string;
  preferredDurationMinutes?: number | null;
  preferredImpact?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  equipment?: 'NONE' | 'HOME' | 'GYM' | null;
  injuries?: string[] | null;
  updatedAt?: string;
};

export type WorkoutHistorySummary = {
  sessions: number;
  avgCompletionRate: number;
  avgDurationMinutes: number;
  streakDays: number;
  lastFeedback: 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD' | null;
};

export type ExerciseMedia = {
  id: string;
  normalizedName: string;
  displayName: string;
  thumbnailLabel?: string | null;
  mediaUrl?: string | null;
  mediaType: 'GIF' | 'MP4' | 'IMAGE' | 'NONE';
  gifUrl?: string | null;
  videoUrl?: string | null;
  demoUrl?: string | null;
};

export type WorkoutSessionSummaryInput = {
  userId: string;
  sessionId: string;
  startedAt?: string;
  completedAt?: string;
  totalDurationMinutes: number;
  completedExercises: number;
  totalExercises: number;
  workoutPlan?: Record<string, unknown>;
  feedback?: 'TOO_EASY' | 'JUST_RIGHT' | 'TOO_HARD';
  sourceApp?: string;
  deviceInstallId?: string;
};

export type NutritionInputType = 'TEXT' | 'IMAGE' | 'TEXT_AND_IMAGE';

export type NutritionIngestInput = {
  inputType: NutritionInputType;
  rawText?: string;
  consumedAt?: string;
  imageUrls?: string[];
  items?: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    calories: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    confidence?: number;
  }>;
};

export type NutritionIngestResponse = {
  id: string;
  userId: string;
  totalCalories: number | null;
  totalProteinG: string | number | null;
  totalCarbsG: string | number | null;
  totalFatG: string | number | null;
  status: string;
  itemCount: number;
  consumedAt: string;
  createdAt: string;
};

export type NutritionEntry = NutritionIngestResponse & {
  items?: unknown[];
  images?: unknown[];
};

export type NotificationOptInSettings = {
  dailyCheckInReminder: boolean;
  weeklyReflection: boolean;
  communityReplies: boolean;
};

export type NotificationSchedulePreferences = {
  timezone: string;
  dailyReminderHourLocal: number;
  weeklyReflectionDayLocal: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  weeklyReflectionHourLocal: number;
};

export type DailyCheckInReminderScheduleInput = {
  userId?: string;
  optIn: NotificationOptInSettings;
  schedule: NotificationSchedulePreferences;
  dispatchNow?: boolean;
};

export type DailyCheckInReminderScheduleResponse = {
  scheduled: boolean;
  reason?: string;
  job?: {
    jobId: string;
    userId: string;
    type: 'DAILY_CHECK_IN_REMINDER';
    scheduledAtUtc: string;
    timezone: string;
    payload: Record<string, unknown>;
  } | null;
  dispatched?: unknown;
};

export type OnboardingInput = {
  primaryGoal: string;
  experienceLevel: string;
  dietaryPreferences: string[];
  timeAvailability: string;
};

export type PlatformContext = {
  userIdentity: {
    id: string;
    email: string | null;
    displayName: string | null;
    onboardingCompleted: boolean;
  };
  workspace: {
    id: string;
    name: string;
    role: 'MEMBER' | 'COACH' | 'ADMIN';
  };
  enabledModules: string[];
};

export type ReportsOverview = {
  days?: number;
  [key: string]: unknown;
};

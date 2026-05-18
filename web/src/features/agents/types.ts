export interface ReasoningStep {
  title: string;
  detail: string;
}

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

export interface AssistantCard {
  id: string;
  type: 'summary' | 'reasoning' | 'next_steps';
  title: string;
  body?: string;
  items?: string[];
  actions?: Array<{ label: string; prompt: string }>;
}

export interface WorkoutExercise {
  name: string;
  durationMin: number;
  reps: string;
  thumbnailLabel?: string;
  gifUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
  note: string;
}

export interface WorkoutPlan {
  planId: string;
  title: string;
  focus: string;
  estimatedTotalMin: number;
  exercises: WorkoutExercise[];
}

export interface MealOption {
  name: string;
  imageUrl: string;
  calories: number;
  proteinG: number;
  prepTimeMin: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
  note: string;
}

export interface MealPlan {
  planId: string;
  title: string;
  goal: string;
  options: MealOption[];
}

export interface NutritionLog {
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
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  routedIntent?: AssistantIntent;
  reasoning?: ReasoningStep[];
  cards?: AssistantCard[];
  workoutPlan?: WorkoutPlan;
  mealPlan?: MealPlan;
  nutritionLog?: NutritionLog;
  createdAt: string;
}

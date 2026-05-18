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

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  routedIntent?: AssistantIntent;
  reasoning?: ReasoningStep[];
  cards?: AssistantCard[];
  workoutPlan?: WorkoutPlan;
  createdAt: string;
}

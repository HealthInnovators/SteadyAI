export type AgentType = 'MEAL_PLANNER' | 'HABIT_COACH' | 'COMMUNITY_GUIDE';

export interface AgentDefinition {
  id: AgentType;
  label: string;
  subtitle: string;
}

export interface ReasoningStep {
  title: string;
  detail: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  reasoning?: ReasoningStep[];
  createdAt: string;
}

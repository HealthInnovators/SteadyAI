export interface ReasoningStep {
  title: string;
  detail: string;
}

export interface AssistantCard {
  id: string;
  type: 'summary' | 'reasoning' | 'next_steps';
  title: string;
  body?: string;
  items?: string[];
  actions?: Array<{ label: string; prompt: string }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  reasoning?: ReasoningStep[];
  cards?: AssistantCard[];
  createdAt: string;
}

export type LlmProviderName = 'openai' | 'gemini' | 'groq';

export interface LlmGenerateTextInput {
  prompt: string;
  systemPrompt?: string;
  provider?: LlmProviderName;
  model?: string;
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
}

export type LlmGenerateTextResult = string;

export interface LlmProviderAdapter {
  provider: LlmProviderName;
  generateText(input: LlmGenerateTextInput): Promise<LlmGenerateTextResult>;
}

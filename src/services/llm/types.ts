export type LlmProviderName = 'openai' | 'gemini' | 'groq';

export interface LlmGenerateTextInput {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
}

export interface LlmGenerateTextResult {
  text: string;
  provider: LlmProviderName;
  model: string;
  finishReason?: string;
  raw: unknown;
}

export interface LlmProviderAdapter {
  provider: LlmProviderName;
  generateText(input: LlmGenerateTextInput): Promise<LlmGenerateTextResult>;
}

export interface LlmClient {
  generateText(input: LlmGenerateTextInput & { provider?: LlmProviderName }): Promise<LlmGenerateTextResult>;
}

export interface LlmClientConfig {
  defaultProvider: LlmProviderName;
  defaultTimeoutMs: number;
  openaiApiKey?: string;
  openaiModel: string;
  geminiApiKey?: string;
  geminiModel: string;
  groqApiKey?: string;
  groqModel: string;
}

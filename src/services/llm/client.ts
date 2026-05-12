import type { LlmProviderAdapter } from './types';
import { OpenAiAdapter } from './adapters/openai.adapter';
import { GeminiAdapter } from './adapters/gemini.adapter';
import { GroqAdapter } from './adapters/groq.adapter';
import type { LlmProviderName, LlmGenerateTextInput, LlmGenerateTextResult } from './types';
import { env } from '../../config/env';

export interface LlmClientConfig {
  defaultProvider: LlmProviderName;
  defaultModel: string;
  defaultTimeoutMs: number;
  openaiApiKey?: string;
  openaiModel?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  groqApiKey?: string;
  groqModel?: string;
}

export class LlmClient {
  private readonly providers: Map<LlmProviderName, LlmProviderAdapter>;

  constructor(
    private readonly config: LlmClientConfig,
    providerAdapters: LlmProviderAdapter[]
  ) {
    this.providers = new Map(providerAdapters.map((provider) => [provider.provider, provider]));
  }

  async generateText(input: LlmGenerateTextInput & { provider?: LlmProviderName }): Promise<LlmGenerateTextResult> {
    const providerName = input.provider ?? this.config.defaultProvider;
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`LLM provider is not configured: ${providerName}`);
    }

    return provider.generateText({
      ...input,
      timeoutMs: input.timeoutMs ?? this.config.defaultTimeoutMs
    });
  }

  async generateObject<T>(options: { prompt: string; systemPrompt?: string; schema: any }): Promise<T> {
    const response = await this.generateText({ prompt: options.prompt, systemPrompt: options.systemPrompt });
    return JSON.parse(response) as T;
  }
}

export function createUnifiedLlmClient(config: LlmClientConfig): LlmClient {
  const providers: LlmProviderAdapter[] = [];

  if (config.openaiApiKey) {
    providers.push(
      new OpenAiAdapter({
        apiKey: config.openaiApiKey,
        defaultModel: config.openaiModel ?? 'gpt-4o',
        defaultTimeoutMs: config.defaultTimeoutMs
      })
    );
  }

  if (config.geminiApiKey) {
    providers.push(
      new GeminiAdapter({
        apiKey: config.geminiApiKey,
        defaultModel: config.geminiModel ?? 'gemini-1.5-pro',
        defaultTimeoutMs: config.defaultTimeoutMs
      })
    );
  }

  if (config.groqApiKey) {
    providers.push(
      new GroqAdapter({
        apiKey: config.groqApiKey,
        defaultModel: config.groqModel ?? 'llama-3.1-70b-versatile',
        defaultTimeoutMs: config.defaultTimeoutMs
      })
    );
  }

  return new LlmClient(config, providers);
}

export function createLlmClientFromEnv(): LlmClient {
  return createUnifiedLlmClient({
    defaultProvider: env.LLM_PROVIDER,
    defaultModel: env.OPENAI_MODEL,
    defaultTimeoutMs: env.LLM_TIMEOUT_MS,
    openaiApiKey: env.OPENAI_API_KEY,
    openaiModel: env.OPENAI_MODEL,
    geminiApiKey: env.GEMINI_API_KEY,
    geminiModel: env.GEMINI_MODEL,
    groqApiKey: env.GROQ_API_KEY,
    groqModel: env.GROQ_MODEL
  });
}

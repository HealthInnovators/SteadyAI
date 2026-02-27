import { env } from '../../config/env';
import { GeminiAdapter } from './adapters/gemini.adapter';
import { GroqAdapter } from './adapters/groq.adapter';
import { OpenAiAdapter } from './adapters/openai.adapter';
import type {
  LlmClient,
  LlmClientConfig,
  LlmGenerateTextInput,
  LlmGenerateTextResult,
  LlmProviderAdapter,
  LlmProviderName
} from './types';

export class UnifiedLlmClient implements LlmClient {
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
}

export function createUnifiedLlmClient(config: LlmClientConfig): LlmClient {
  const providers: LlmProviderAdapter[] = [];

  if (config.openaiApiKey) {
    providers.push(
      new OpenAiAdapter({
        apiKey: config.openaiApiKey,
        defaultModel: config.openaiModel,
        defaultTimeoutMs: config.defaultTimeoutMs
      })
    );
  }

  if (config.geminiApiKey) {
    providers.push(
      new GeminiAdapter({
        apiKey: config.geminiApiKey,
        defaultModel: config.geminiModel,
        defaultTimeoutMs: config.defaultTimeoutMs
      })
    );
  }

  if (config.groqApiKey) {
    providers.push(
      new GroqAdapter({
        apiKey: config.groqApiKey,
        defaultModel: config.groqModel,
        defaultTimeoutMs: config.defaultTimeoutMs
      })
    );
  }

  return new UnifiedLlmClient(config, providers);
}

export function createLlmClientFromEnv(): LlmClient {
  return createUnifiedLlmClient({
    defaultProvider: env.LLM_PROVIDER,
    defaultTimeoutMs: env.LLM_TIMEOUT_MS,
    openaiApiKey: env.OPENAI_API_KEY,
    openaiModel: env.OPENAI_MODEL,
    geminiApiKey: env.GEMINI_API_KEY,
    geminiModel: env.GEMINI_MODEL,
    groqApiKey: env.GROQ_API_KEY,
    groqModel: env.GROQ_MODEL
  });
}

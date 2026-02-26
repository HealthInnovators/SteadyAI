import type { LlmGenerateTextInput, LlmGenerateTextResult, LlmProviderAdapter } from '../types';

interface OpenAiAdapterConfig {
  apiKey: string;
  defaultModel: string;
  defaultTimeoutMs: number;
}

function clampTemperature(value?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0.2;
  }
  return Math.min(Math.max(value, 0), 1);
}

function getTimeout(value: number | undefined, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return fallback;
  }
  return value;
}

export class OpenAiAdapter implements LlmProviderAdapter {
  public readonly provider = 'openai' as const;

  constructor(private readonly config: OpenAiAdapterConfig) {}

  async generateText(input: LlmGenerateTextInput): Promise<LlmGenerateTextResult> {
    const model = input.model ?? this.config.defaultModel;
    const timeoutMs = getTimeout(input.timeoutMs, this.config.defaultTimeoutMs);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
      if (input.systemPrompt) {
        messages.push({ role: 'system', content: input.systemPrompt });
      }
      messages.push({ role: 'user', content: input.prompt });

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: clampTemperature(input.temperature),
          max_tokens: input.maxOutputTokens ?? 512
        })
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI request failed: ${response.status} ${body}`);
      }

      const raw = (await response.json()) as Record<string, unknown>;
      const choices = raw.choices as Array<Record<string, unknown>> | undefined;
      const firstChoice = choices?.[0] as Record<string, unknown> | undefined;
      const message = firstChoice?.message as Record<string, unknown> | undefined;
      const content = typeof message?.content === 'string' ? message.content : '';
      const finishReason = typeof firstChoice?.finish_reason === 'string' ? firstChoice.finish_reason : undefined;

      return {
        text: content,
        provider: this.provider,
        model,
        finishReason,
        raw
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`OpenAI request timed out after ${timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

import type { LlmGenerateTextInput, LlmGenerateTextResult, LlmProviderAdapter } from '../types';

interface GeminiAdapterConfig {
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

export class GeminiAdapter implements LlmProviderAdapter {
  public readonly provider = 'gemini' as const;

  constructor(private readonly config: GeminiAdapterConfig) {}

  async generateText(input: LlmGenerateTextInput): Promise<LlmGenerateTextResult> {
    const model = input.model ?? this.config.defaultModel;
    const timeoutMs = getTimeout(input.timeoutMs, this.config.defaultTimeoutMs);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const prompt = input.systemPrompt ? `${input.systemPrompt}\n\n${input.prompt}` : input.prompt;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: clampTemperature(input.temperature),
              maxOutputTokens: input.maxOutputTokens ?? 512
            }
          })
        }
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Gemini request failed: ${response.status} ${body}`);
      }

      const raw = (await response.json()) as Record<string, unknown>;
      const candidates = raw.candidates as Array<Record<string, unknown>> | undefined;
      const first = candidates?.[0] as Record<string, unknown> | undefined;
      const content = first?.content as Record<string, unknown> | undefined;
      const parts = content?.parts as Array<Record<string, unknown>> | undefined;
      const text = typeof parts?.[0]?.text === 'string' ? (parts[0].text as string) : '';
      const finishReason = typeof first?.finishReason === 'string' ? first.finishReason : undefined;

      return {
        text,
        provider: this.provider,
        model,
        finishReason,
        raw
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Gemini request timed out after ${timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

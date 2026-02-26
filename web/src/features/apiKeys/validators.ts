import type { ApiProvider } from './types';

export function validateApiKey(provider: ApiProvider, value: string): string | null {
  const key = value.trim();
  if (!key) {
    return 'API key is required.';
  }

  if (key.length < 20) {
    return 'API key looks too short.';
  }

  switch (provider) {
    case 'GEMINI':
      return key.startsWith('AIza') ? null : "Gemini key should start with 'AIza'.";
    case 'GROQ':
      return key.startsWith('gsk_') ? null : "Groq key should start with 'gsk_'.";
    default:
      return 'Unsupported provider.';
  }
}

export function maskApiKey(value: string | undefined): string {
  if (!value) {
    return 'Not saved';
  }

  const trimmed = value.trim();
  if (trimmed.length <= 8) {
    return `${trimmed.slice(0, 2)}****`;
  }

  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

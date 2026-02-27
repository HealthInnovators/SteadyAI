import type { ProviderConfig } from './types';

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'GEMINI',
    label: 'Google Gemini',
    placeholder: 'AIza... ',
    hint: "Expected format usually starts with 'AIza'"
  },
  {
    id: 'GROQ',
    label: 'Groq',
    placeholder: 'gsk_... ',
    hint: "Expected format usually starts with 'gsk_'"
  }
];

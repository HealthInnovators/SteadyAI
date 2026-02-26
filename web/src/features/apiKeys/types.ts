export type ApiProvider = 'GEMINI' | 'GROQ';

export interface ProviderConfig {
  id: ApiProvider;
  label: string;
  placeholder: string;
  hint: string;
}

export interface StoredApiKeys {
  GEMINI?: string;
  GROQ?: string;
}

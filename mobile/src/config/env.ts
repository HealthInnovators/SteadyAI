import Constants from 'expo-constants';

type AppExtra = {
  apiBaseUrl?: string;
  webBaseUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  const resolved = value?.trim() || fallback;
  return resolved.replace(/\/+$/, '');
}

export const env = {
  apiBaseUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL, extra.apiBaseUrl ?? 'https://api.goodhealth247.com'),
  webBaseUrl: normalizeBaseUrl(process.env.EXPO_PUBLIC_WEB_BASE_URL, extra.webBaseUrl ?? 'https://www.goodhealth247.com'),
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || '',
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || ''
};

export function isSupabaseConfigured(): boolean {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey);
}

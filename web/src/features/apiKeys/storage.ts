import type { ApiProvider, StoredApiKeys } from './types';

const STORAGE_KEY = 'steadyai.providerApiKeys.v1';

export function loadApiKeys(): StoredApiKeys {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as StoredApiKeys;
  } catch {
    return {};
  }
}

export function saveApiKey(provider: ApiProvider, key: string): StoredApiKeys {
  const current = loadApiKeys();
  const updated: StoredApiKeys = { ...current, [provider]: key.trim() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearApiKey(provider: ApiProvider): StoredApiKeys {
  const current = loadApiKeys();
  const updated: StoredApiKeys = { ...current };
  delete updated[provider];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

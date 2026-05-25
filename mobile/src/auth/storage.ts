import * as SecureStore from 'expo-secure-store';
import type { SupportedStorage } from '@supabase/supabase-js';

export const secureSessionStorage: SupportedStorage = {
  async getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK
    });
  },
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
};

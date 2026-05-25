import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { secureSessionStorage } from './storage';

let mobileClient: SupabaseClient | null = null;

export function createMobileSupabaseClient(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    return null;
  }

  if (!mobileClient) {
    mobileClient = createClient(env.supabaseUrl, env.supabasePublishableKey, {
      auth: {
        storage: secureSessionStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
  }

  return mobileClient;
}

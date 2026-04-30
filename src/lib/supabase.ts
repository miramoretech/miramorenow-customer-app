// src/lib/supabase.ts - FIXED with lock override
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dxwmzkvhckjzacfozgrv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ZSq1MxnQI2mwN-SrrwdIRw_fJgi-DUT';

// ✅ 1. Define a no‑op lock function (bypasses Web Locks API)
const NO_OP_LOCK = async (_name: string, _acquireTimeout: number, fn: () => Promise<unknown>) => {
  return await fn();
};

const webStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage getItem error:', error);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage setItem error:', error);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage removeItem error:', error);
    }
  },
};

// ✅ Singleton pattern – only one instance
let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseInstance() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: webStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // ✅ 2. Apply the no‑op lock here – this fixes the deadlock
        lock: NO_OP_LOCK,
        // Optional: set a timeout for token operations (10 seconds)
        acquireTimeout: 10000,
      },
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    });
  }
  return supabaseInstance;
}

// ✅ Export as constant – works with all existing imports
export const supabase = getSupabaseInstance();
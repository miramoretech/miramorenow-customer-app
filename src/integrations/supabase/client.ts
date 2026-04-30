import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dxwmzkvhckjzacfozgrv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZSq1MxnQI2mwN-SrrwdIRw_fJgi-DUT";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
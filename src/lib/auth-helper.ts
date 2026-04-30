// src/lib/auth-helper.ts
import { supabase } from "@/integrations/supabase/client";

let authPromise: Promise<any> | null = null;
let sessionPromise: Promise<any> | null = null;

export function getSharedUser() {
  if (!authPromise) {
    authPromise = supabase.auth.getUser().finally(() => {
      authPromise = null;
    });
  }
  return authPromise;
}

export function getSharedSession() {
  if (!sessionPromise) {
    sessionPromise = supabase.auth.getSession().finally(() => {
      sessionPromise = null;
    });
  }
  return sessionPromise;
}
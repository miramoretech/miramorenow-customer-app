import { supabase } from "./supabase";

let authPromise: Promise<any> | null = null;

export function getSharedUser() {
  if (!authPromise) {
    authPromise = supabase.auth.getUser().finally(() => {
      authPromise = null;
    });
  }
  return authPromise;
}

export function getSharedSession() {
  if (!authPromise) {
    authPromise = supabase.auth.getSession().finally(() => {
      authPromise = null;
    });
  }
  return authPromise;
}
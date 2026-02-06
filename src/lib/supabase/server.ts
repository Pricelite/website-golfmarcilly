import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "../env";

export function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseEnv();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

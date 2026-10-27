import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "./admin";
import { sharedContentSyncEnabled, validateSharedContentConfig } from "./content-config";
export { localContentStoreEnabled, sharedContentSyncEnabled } from "./content-config";

export function createContentAdminClient() {
  if (!sharedContentSyncEnabled()) {
    return createSupabaseAdminClient();
  }

  const { url, serviceRoleKey } = validateSharedContentConfig(
    process.env.CONTENT_SUPABASE_URL, process.env.CONTENT_SUPABASE_SERVICE_ROLE_KEY,
  );

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

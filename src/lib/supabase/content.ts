import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "./admin";

export function localContentStoreEnabled() {
  return process.env.NODE_ENV === "development" && !sharedContentSyncEnabled();
}

export function sharedContentSyncEnabled() {
  return process.env.NODE_ENV === "development" && process.env.CONTENT_SYNC_ENABLED === "true";
}

export function createContentAdminClient() {
  if (!sharedContentSyncEnabled()) {
    return createSupabaseAdminClient();
  }

  const url = process.env.CONTENT_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.CONTENT_SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) throw new Error("Shared content Supabase configuration is incomplete");
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
    throw new Error("Shared content Supabase URL must be HTTPS without credentials or parameters");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

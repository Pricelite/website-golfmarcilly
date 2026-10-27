export function sharedContentSyncEnabled() {
  return process.env.NODE_ENV === "development" && process.env.CONTENT_SYNC_ENABLED === "true";
}

export function localContentStoreEnabled() {
  return process.env.NODE_ENV === "development" && !sharedContentSyncEnabled();
}

export function validateSharedContentConfig(url: string | undefined, serviceRoleKey: string | undefined) {
  const trimmedUrl = url?.trim();
  const trimmedKey = serviceRoleKey?.trim();
  if (!trimmedUrl || !trimmedKey) throw new Error("Shared content Supabase configuration is incomplete");
  const parsedUrl = new URL(trimmedUrl);
  if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password || parsedUrl.search || parsedUrl.hash) {
    throw new Error("Shared content Supabase URL must be HTTPS without credentials or parameters");
  }
  return { url: trimmedUrl, serviceRoleKey: trimmedKey };
}

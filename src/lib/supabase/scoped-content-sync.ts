import "server-only";

import { siteConfig } from "@/data/site";
import { scopedContentSyncEnabled } from "./content-config";

export { scopedContentSyncEnabled } from "./content-config";

export class ScopedContentError extends Error {
  constructor(public readonly status: number) {
    super("Scoped content synchronization is unavailable");
  }
}

export async function scopedContentRequest<T>(action: string, payload?: unknown): Promise<T> {
  const token = process.env.CONTENT_SYNC_TOKEN?.trim();
  if (!scopedContentSyncEnabled() || !token || token.length < 32) {
    throw new Error("Scoped content synchronization is not configured");
  }
  const response = await fetch(new URL("/api/ops/content-sync", siteConfig.url), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new ScopedContentError(response.status);
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("result" in result)) {
    throw new Error("Scoped content synchronization returned an invalid response");
  }
  return (result as { result: T }).result;
}

import "server-only";
import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTrustedRequestOrigin } from "./trusted-origin";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  namespace: string;
  identifier: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
  unavailable?: boolean;
};

const rateLimitStore = new Map<string, RateLimitBucket>();

function cleanupExpiredRateLimits(now: number): void {
  if (rateLimitStore.size < 2048) {
    return;
  }

  for (const [key, bucket] of rateLimitStore) {
    if (bucket.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function parseClientIpFromHeaders(headers: Headers): string {
  // Vercel overwrites this header with the client IP. Other hosts must provide
  // an equivalent trusted proxy header before production traffic is enabled.
  const vercelIp = headers.get("x-vercel-forwarded-for")?.trim();
  if (vercelIp) return vercelIp;

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const cloudflareIp = headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) {
    return cloudflareIp;
  }

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Use the hop nearest the trusted proxy, not the client-controlled first hop.
    const lastIp = forwardedFor.split(",").at(-1)?.trim();
    if (lastIp) return lastIp;
  }

  return "unknown";
}

export function hasTrustedOrigin(
  headers: Headers,
  options?: { fallbackHost?: string }
): boolean {
  return isTrustedRequestOrigin(headers, {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    additionalOrigins: process.env.FORM_ALLOWED_ORIGINS,
    fallbackHost: options?.fallbackHost,
    development: process.env.NODE_ENV === "development",
  });
}

function consumeLocalRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpiredRateLimits(now);

  const key = `${options.namespace}:${options.identifier}`;
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000)
      ),
    };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);

  return { allowed: true, retryAfterSeconds: 0 };
}

export async function consumeRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  if (process.env.NODE_ENV !== "production") return consumeLocalRateLimit(options);

  const key = createHash("sha256").update(`${options.namespace}:${options.identifier}`).digest("hex");
  try {
    const { data, error } = await createSupabaseAdminClient().rpc("consume_public_rate_limit", {
      p_key: key,
      p_limit: options.limit,
      p_window_seconds: Math.ceil(options.windowMs / 1000),
    });
    if (error) throw error;
    const result = Array.isArray(data) ? data[0] : data;
    if (typeof result?.allowed !== "boolean" || !Number.isFinite(result?.retry_after_seconds)) throw new Error("Invalid rate-limit result");
    return { allowed: result.allowed, retryAfterSeconds: result.retry_after_seconds };
  } catch {
    // Fail closed if the shared limiter is unavailable in production.
    return { allowed: false, retryAfterSeconds: 60, unavailable: true };
  }
}

import "server-only";
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
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const cloudflareIp = headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) {
    return cloudflareIp;
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

export function consumeRateLimit(options: RateLimitOptions): RateLimitResult {
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

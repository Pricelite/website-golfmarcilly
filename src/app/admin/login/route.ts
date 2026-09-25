import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSessionMaxAgeSeconds,
} from "@/lib/initiation/admin-auth";
import { getAdminPassword } from "@/lib/initiation/env";
import {
  consumeRateLimit,
  hasTrustedOrigin,
  parseClientIpFromHeaders,
} from "@/lib/security/request-guards";

const ADMIN_LOGIN_RATE_LIMIT_MAX_REQUESTS = 8;
const ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function safeCompare(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function redirectToAdmin(url: string, params?: Record<string, string>, path = "/admin") {
  const target = new URL(path, url);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      target.searchParams.set(key, value);
    }
  }
  return NextResponse.redirect(target, 303);
}

export async function POST(request: Request) {
  const fallbackHost = new URL(request.url).host;
  if (!hasTrustedOrigin(request.headers, { fallbackHost })) {
    return redirectToAdmin(request.url, { error: "untrusted_origin" });
  }

  const requesterIp = parseClientIpFromHeaders(request.headers);
  const rateLimit = await consumeRateLimit({
    namespace: "admin-login",
    identifier: requesterIp,
    limit: ADMIN_LOGIN_RATE_LIMIT_MAX_REQUESTS,
    windowMs: ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return redirectToAdmin(request.url, { error: rateLimit.unavailable ? "unavailable" : "rate_limited" });
  }

  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return redirectToAdmin(request.url, { error: "unavailable" });
  }
  let formData: FormData;
  try { formData = await request.formData(); }
  catch { return redirectToAdmin(request.url, { error: "missing_password" }); }
  const next = formData.get("next") === "/admin/competitions" ? "/admin/competitions" : "/admin";
  const passwordValue = formData.get("password");
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!password) {
    return redirectToAdmin(request.url, { error: "missing_password", next });
  }

  if (!safeCompare(password, getAdminPassword())) {
    return redirectToAdmin(request.url, { error: "invalid_password", next });
  }

  const response = redirectToAdmin(request.url, undefined, next);
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, await createAdminSessionToken(password), {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge: getAdminSessionMaxAgeSeconds(),
  });

  return response;
}

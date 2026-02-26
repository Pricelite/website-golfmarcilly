import { NextResponse } from "next/server";

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

function redirectToAdmin(url: string, params?: Record<string, string>) {
  const target = new URL("/admin", url);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      target.searchParams.set(key, value);
    }
  }
  return NextResponse.redirect(target);
}

export async function POST(request: Request) {
  const fallbackHost = new URL(request.url).host;
  if (!hasTrustedOrigin(request.headers, { fallbackHost })) {
    return redirectToAdmin(request.url, { error: "untrusted_origin" });
  }

  const requesterIp = parseClientIpFromHeaders(request.headers);
  const rateLimit = consumeRateLimit({
    namespace: "admin-login",
    identifier: requesterIp,
    limit: ADMIN_LOGIN_RATE_LIMIT_MAX_REQUESTS,
    windowMs: ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return redirectToAdmin(request.url, { error: "rate_limited" });
  }

  const formData = await request.formData();
  const passwordValue = formData.get("password");
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!password) {
    return redirectToAdmin(request.url, { error: "missing_password" });
  }

  if (password !== getAdminPassword()) {
    return redirectToAdmin(request.url, { error: "invalid_password" });
  }

  const response = redirectToAdmin(request.url);
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, createAdminSessionToken(password), {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge: getAdminSessionMaxAgeSeconds(),
  });

  return response;
}

import { timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";

function safeCompare(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

export function getOpsTokenFromRequest(
  request: Request | NextRequest
): string {
  const bearer = request.headers.get("authorization")?.trim();
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    return bearer.slice(7).trim();
  }

  return request.headers.get("x-ops-token")?.trim() || "";
}

export function hasValidOpsToken(
  request: Request | NextRequest,
  expectedToken: string | undefined
): boolean {
  const token = expectedToken?.trim();
  if (!token) {
    return false;
  }

  const providedToken = getOpsTokenFromRequest(request);
  if (!providedToken) {
    return false;
  }

  return safeCompare(providedToken, token);
}


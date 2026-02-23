import "server-only";

import { createHash } from "node:crypto";

import { getAdminPassword } from "./env";

export const ADMIN_SESSION_COOKIE_NAME = "initiation_admin_session";
const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function hashToken(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function createAdminSessionToken(password: string): string {
  return hashToken(`initiation-admin:${password}`);
}

export function getExpectedAdminSessionToken(): string {
  return createAdminSessionToken(getAdminPassword());
}

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

export function isAdminAuthenticated(cookiesStore: CookieReader): boolean {
  const currentToken = cookiesStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!currentToken) {
    return false;
  }

  return currentToken === getExpectedAdminSessionToken();
}

export function getAdminSessionMaxAgeSeconds(): number {
  return ADMIN_SESSION_MAX_AGE_SECONDS;
}

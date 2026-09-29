import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  isAdminAuthenticated,
} from "./admin-auth";

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

function createCookieReader(value: string | null): CookieReader {
  return {
    get(name: string) {
      if (name !== ADMIN_SESSION_COOKIE_NAME || !value) {
        return undefined;
      }

      return { value };
    },
  };
}

test("signed admin session token is accepted", async () => {
  process.env.ADMIN_PASSWORD = "phase-test-password";
  process.env.ADMIN_SESSION_SECRET = "phase-test-secret";

  const token = await createAdminSessionToken("phase-test-password");
  const authenticated = await isAdminAuthenticated(createCookieReader(token));

  assert.equal(authenticated, true);
});

test("legacy admin session token is rejected", async () => {
  process.env.ADMIN_PASSWORD = "phase-test-password";
  delete process.env.ADMIN_SESSION_SECRET;

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("initiation-admin:phase-test-password"));
  const token = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const authenticated = await isAdminAuthenticated(createCookieReader(token));

  assert.equal(authenticated, false);
});

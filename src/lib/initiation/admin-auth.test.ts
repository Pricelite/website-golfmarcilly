import assert from "node:assert/strict";
import test from "node:test";

import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionToken,
  getExpectedLegacyAdminSessionToken,
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

test("legacy admin session token stays accepted during migration", async () => {
  process.env.ADMIN_PASSWORD = "phase-test-password";
  delete process.env.ADMIN_SESSION_SECRET;

  const token = await getExpectedLegacyAdminSessionToken();
  const authenticated = await isAdminAuthenticated(createCookieReader(token));

  assert.equal(authenticated, true);
});

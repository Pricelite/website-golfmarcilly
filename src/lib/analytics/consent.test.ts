import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { ANALYTICS_CONSENT_KEY, analyticsConsentBootstrap, readAnalyticsConsent } from "./consent";

test("only an explicit existing yes/no choice is accepted before paint", () => {
  for (const value of ["yes", "no", null, "unknown", "true"]) {
    const attributes: Record<string, string> = {};
    const storage = { getItem: (key: string) => { assert.equal(key, ANALYTICS_CONSENT_KEY); return value; } };
    const expected = value === "yes" || value === "no" ? value : null;
    assert.equal(readAnalyticsConsent(storage), expected);
    // No storage setter, fetch, crypto or cookie exists in this context.
    runInNewContext(analyticsConsentBootstrap, { localStorage: storage, document: { documentElement: { setAttribute: (key: string, stored: string) => { attributes[key] = stored; } } } });
    assert.equal(attributes["data-analytics-consent"] ?? null, expected);
  }
});

test("unavailable storage never implies consent or prevents rendering", () => {
  const storage = { getItem: () => { throw new Error("unavailable"); } };
  assert.equal(readAnalyticsConsent(storage), null);
  assert.doesNotThrow(() => runInNewContext(analyticsConsentBootstrap, { localStorage: storage }));
  assert.doesNotThrow(() => runInNewContext(analyticsConsentBootstrap, {}));
});

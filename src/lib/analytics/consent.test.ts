import assert from "node:assert/strict";
import test from "node:test";
import { runInNewContext } from "node:vm";
import { ANALYTICS_CONSENT_KEY, CONSENT_DURATION_MS, analyticsConsentBootstrap, readAnalyticsConsent, saveAnalyticsConsent } from "./consent";

test("only an explicit, recent yes/no choice is accepted before paint", () => {
  const now = Date.now();
  for (const [value, expected] of [
    [JSON.stringify({ value: "yes", at: now }), "yes"],
    [JSON.stringify({ value: "no", at: now }), "no"],
    [JSON.stringify({ value: "yes", at: now - CONSENT_DURATION_MS }), null],
    [JSON.stringify({ value: "yes", at: now + 1000 }), null],
    ["yes", null], [null, null], ["unknown", null],
  ] as const) {
    const attributes: Record<string, string> = {};
    const storage = { getItem: (key: string) => { assert.equal(key, ANALYTICS_CONSENT_KEY); return value; } };
    assert.equal(readAnalyticsConsent(storage, now), expected);
    // No storage setter, fetch, crypto or cookie exists in this context.
    runInNewContext(analyticsConsentBootstrap, { localStorage: storage, document: { documentElement: { setAttribute: (key: string, stored: string) => { attributes[key] = stored; } } } });
    assert.equal(attributes["data-analytics-consent"] ?? null, expected);
  }
});

test("a saved refusal is valid for six months and can be changed", () => {
  let stored = "";
  const storage = { getItem: () => stored, setItem: (_key: string, value: string) => { stored = value; } };
  saveAnalyticsConsent(storage, "no", 1000);
  assert.equal(readAnalyticsConsent(storage, 1000 + CONSENT_DURATION_MS - 1), "no");
  assert.equal(readAnalyticsConsent(storage, 1000 + CONSENT_DURATION_MS), null);
  saveAnalyticsConsent(storage, "yes", 1000 + CONSENT_DURATION_MS);
  assert.equal(readAnalyticsConsent(storage, 1000 + CONSENT_DURATION_MS), "yes");
});

test("unavailable storage never implies consent or prevents rendering", () => {
  const storage = { getItem: () => { throw new Error("unavailable"); } };
  assert.equal(readAnalyticsConsent(storage), null);
  assert.doesNotThrow(() => runInNewContext(analyticsConsentBootstrap, { localStorage: storage }));
  assert.doesNotThrow(() => runInNewContext(analyticsConsentBootstrap, {}));
});

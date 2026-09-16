import assert from "node:assert/strict";
import test from "node:test";
import { isTrustedRequestOrigin } from "./trusted-origin";

const siteUrl = "https://golf.example";
const headers = (origin: string) => new Headers({ origin, referer: `${origin}/restaurant` });

test("public forms accept the configured origin and explicitly allowed aliases", () => {
  assert.equal(isTrustedRequestOrigin(headers(siteUrl), { siteUrl }), true);
  assert.equal(isTrustedRequestOrigin(headers("https://www.golf.example"), {
    siteUrl, additionalOrigins: "https://www.golf.example",
  }), true);
});

test("local development works even with a production canonical URL", () => {
  assert.equal(isTrustedRequestOrigin(headers("http://localhost:3000"), {
    siteUrl, fallbackHost: "localhost:3000", development: true,
  }), true);
  assert.equal(isTrustedRequestOrigin(headers("http://localhost:3000"), {
    siteUrl, fallbackHost: "localhost:3000", development: false,
  }), false);
});

test("forms reject foreign, missing, malformed, downgraded and mismatched origins", () => {
  for (const origin of ["https://attacker.example", "null", "http://golf.example", "https://golf.example:444"]) {
    assert.equal(isTrustedRequestOrigin(headers(origin), { siteUrl, fallbackHost: "attacker.example" }), false);
  }
  assert.equal(isTrustedRequestOrigin(new Headers(), { siteUrl }), false);
  assert.equal(isTrustedRequestOrigin(headers(siteUrl), {}), false);
  assert.equal(isTrustedRequestOrigin(new Headers({ origin: siteUrl, referer: "https://attacker.example" }), { siteUrl }), false);
});

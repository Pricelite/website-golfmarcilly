import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

test("preview protection covers pages, assets, mutations, admin and health without changing normal mode", () => {
  const before = { mode: process.env.PREVIEW_MODE, password: process.env.PREVIEW_PASSWORD, username: process.env.PREVIEW_USERNAME };
  const password = "private-test-passphrase";
  const request = (path: string, method = "GET", authorized = false) => new NextRequest(`https://preview.example.org${path}`, {
    method, headers: authorized ? { authorization: `Basic ${Buffer.from(`visiteur:${password}`).toString("base64")}` } : {},
  });
  try {
    process.env.PREVIEW_MODE = "false";
    assert.equal(proxy(request("/api/contact", "POST")).headers.get("x-middleware-next"), "1");
    process.env.PREVIEW_MODE = "true";
    process.env.PREVIEW_PASSWORD = "";
    assert.equal(proxy(request("/")).status, 503);
    process.env.PREVIEW_PASSWORD = password;
    process.env.PREVIEW_USERNAME = "visiteur";
    for (const path of ["/", "/images/bar.jpg", "/_next/image?url=x"]) assert.equal(proxy(request(path)).status, 401);
    const page = proxy(request("/restaurant", "GET", true));
    assert.equal(page.headers.get("x-middleware-next"), "1");
    assert.match(page.headers.get("x-robots-tag")!, /noindex/);
    assert.match(page.headers.get("cache-control")!, /no-store/);
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) assert.equal(proxy(request("/api/contact", method, true)).status, 403);
    for (const path of ["/admin", "/api/backoffice/media", "/api/ops/fallback-queue", "/api/health"]) assert.equal(proxy(request(path, "GET", true)).status, 403);
    assert.equal(proxy(request("/_preview-health")).status, 200);
    assert.equal(proxy(request("/_preview-health", "POST", true)).status, 403);
  } finally {
    for (const [key, value] of Object.entries({ PREVIEW_MODE: before.mode, PREVIEW_PASSWORD: before.password, PREVIEW_USERNAME: before.username })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

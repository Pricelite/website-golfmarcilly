import assert from "node:assert/strict";
import test from "node:test";
import { validPreviewCredentials, previewPathBlocked } from "./preview-access";

test("preview requires the exact credentials and rejects missing or weak configuration", () => {
  const password = "private-demo-passphrase";
  const auth = (value: string) => `Basic ${Buffer.from(value).toString("base64")}`;
  assert.equal(validPreviewCredentials(auth(`visiteur:${password}`), "visiteur", password), true);
  for (const header of [null, "Bearer anything", "Basic !!!", auth("visiteur:wrong"), auth(`other:${password}`)]) {
    assert.equal(validPreviewCredentials(header, "visiteur", password), false);
  }
  assert.equal(validPreviewCredentials(auth("visiteur:short"), "visiteur", "short"), false);
});

test("preview blocks administrative and operational routes without hiding public forms", () => {
  for (const path of ["/admin", "/admin/contenu", "/api/admin/daily-menu", "/api/backoffice/media", "/api/ops/fallback-queue", "/api/health"]) assert.equal(previewPathBlocked(path), true);
  for (const path of ["/", "/restaurant", "/initiation/reservation", "/api/initiation-options", "/partners/us-orleans.png"]) assert.equal(previewPathBlocked(path), false);
});

import assert from "node:assert/strict";
import test from "node:test";
import { can, grantCreatedPage, parseGrants, parsePageContent } from "./model";

test("permissions deny by default and scope actions to assigned pages", () => {
  const pageId = "00000000-0000-0000-0000-000000000001";
  const otherId = "00000000-0000-0000-0000-000000000002";
  const grants = parseGrants([{ resource: `page:${pageId}`, actions: ["view", "edit", "submit"] }]);
  assert.ok(grants);
  assert.equal(can(grants, "contributor", "edit", `page:${pageId}`), true);
  assert.equal(can(grants, "contributor", "publish", `page:${pageId}`), false);
  assert.equal(can(grants, "contributor", "view", `page:${otherId}`), false);
  assert.equal(can([], "editor", "view", `page:${pageId}`), false);
  assert.equal(can([], "admin", "publish", `page:${otherId}`), true);
});

test("a contributor who creates a page can then view and edit that page only", () => {
  const ownId = "00000000-0000-0000-0000-000000000003";
  const otherId = "00000000-0000-0000-0000-000000000004";
  const grants = grantCreatedPage([{ resource: "pages", actions: ["create"] }], "contributor", ownId);
  assert.equal(can(grants, "contributor", "view", `page:${ownId}`), true);
  assert.equal(can(grants, "contributor", "edit", `page:${ownId}`), true);
  assert.equal(can(grants, "contributor", "view", `page:${otherId}`), false);
  assert.equal(can(grants, "contributor", "publish", `page:${ownId}`), false);
});

test("page content accepts known blocks and rejects scriptable links", () => {
  const base = { title: "Essai", seoTitle: "Essai", seoDescription: "", theme: "cream", blocks: [] };
  assert.ok(parsePageContent(base));
  assert.equal(parsePageContent({ ...base, blocks: [{ id: "00000000-0000-0000-0000-000000000001", type: "button", text: "Voir", href: "javascript:alert(1)" }] }), null);
  assert.equal(parsePageContent({ ...base, theme: "<script>" }), null);
});

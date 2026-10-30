import assert from "node:assert/strict";
import test from "node:test";

import { addDays, isIdentifiableBot, needsNewVisit, parisDay, publicPath, reportRange, validDay, validUuid, VISIT_TIMEOUT_MS } from "./core";

test("Paris day follows summer and winter time", () => {
  assert.equal(parisDay(new Date("2026-03-29T22:30:00Z")), "2026-03-30");
  assert.equal(parisDay(new Date("2026-10-25T22:30:00Z")), "2026-10-25");
});

test("date ranges compare with the immediately previous period", () => {
  assert.deepEqual(reportRange("2026-10-24", "2026-10-30", "2026-10-30"), {
    start: "2026-10-24", end: "2026-10-30", previousStart: "2026-10-17", previousEnd: "2026-10-23",
  });
  assert.equal(addDays("2026-03-01", -1), "2026-02-28");
  assert.equal(reportRange("2026-10-31", "2026-10-31", "2026-10-30"), null);
  assert.equal(reportRange("2025-01-01", "2026-10-30", "2026-10-30"), null);
  assert.equal(validDay("2026-02-30"), false);
});

test("a visit expires after 30 minutes of inactivity", () => {
  const now = 2_000_000;
  assert.equal(needsNewVisit("visit", now - VISIT_TIMEOUT_MS, now), false);
  assert.equal(needsNewVisit("visit", now - VISIT_TIMEOUT_MS - 1, now), true);
  assert.equal(needsNewVisit(null, now - 1000, now), true);
  assert.equal(needsNewVisit("visit", now + 1000, now), true);
});

test("only public paths without query data and valid identifiers are accepted", () => {
  assert.equal(publicPath("/restaurant"), "/restaurant");
  assert.equal(publicPath("/restaurant?email=test@example.com"), null);
  assert.equal(publicPath("/admin/statistiques"), null);
  assert.equal(publicPath("/api/contact"), null);
  assert.equal(validUuid("123e4567-e89b-12d3-a456-426614174000"), true);
  assert.equal(validUuid("not-an-id"), false);
  assert.equal(isIdentifiableBot("Googlebot/2.1"), true);
  assert.equal(isIdentifiableBot("Mozilla/5.0"), false);
});

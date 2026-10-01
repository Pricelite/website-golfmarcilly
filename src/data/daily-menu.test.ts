import assert from "node:assert/strict";
import test from "node:test";

import { isDailyMenuDisplayTime, parisDateKey } from "./daily-menu";

test("daily menu date follows Paris midnight, including the summer offset", () => {
  assert.equal(parisDateKey(new Date("2026-09-29T21:59:59Z")), "2026-09-29");
  assert.equal(parisDateKey(new Date("2026-09-29T22:00:00Z")), "2026-09-30");
  assert.equal(parisDateKey(new Date("2026-12-29T22:59:59Z")), "2026-12-29");
  assert.equal(parisDateKey(new Date("2026-12-29T23:00:00Z")), "2026-12-30");
});

test("daily menu is displayed from 10:00 until 15:00 in Paris", () => {
  assert.equal(isDailyMenuDisplayTime(new Date("2026-07-01T07:59:59Z")), false);
  assert.equal(isDailyMenuDisplayTime(new Date("2026-07-01T08:00:00Z")), true);
  assert.equal(isDailyMenuDisplayTime(new Date("2026-07-01T12:59:59Z")), true);
  assert.equal(isDailyMenuDisplayTime(new Date("2026-07-01T13:00:00Z")), false);
  assert.equal(isDailyMenuDisplayTime(new Date("2026-12-01T09:00:00Z")), true);
  assert.equal(isDailyMenuDisplayTime(new Date("2026-12-01T14:00:00Z")), false);
});

import assert from "node:assert/strict";
import test from "node:test";

import { isWeekdaySpecialDate, parisDateKey } from "./daily-menu";

test("daily menu date follows Paris midnight, including the summer offset", () => {
  assert.equal(parisDateKey(new Date("2026-09-29T21:59:59Z")), "2026-09-29");
  assert.equal(parisDateKey(new Date("2026-09-29T22:00:00Z")), "2026-09-30");
  assert.equal(parisDateKey(new Date("2026-12-29T22:59:59Z")), "2026-12-29");
  assert.equal(parisDateKey(new Date("2026-12-29T23:00:00Z")), "2026-12-30");
});

test("weekday special is visible only on its Paris date and never on weekends", () => {
  assert.equal(isWeekdaySpecialDate("2026-10-29", new Date("2026-10-29T12:00:00Z")), true);
  assert.equal(isWeekdaySpecialDate("2026-10-28", new Date("2026-10-29T12:00:00Z")), false);
  assert.equal(isWeekdaySpecialDate("2026-10-31", new Date("2026-10-31T12:00:00Z")), false);
  assert.equal(isWeekdaySpecialDate("2026-11-01", new Date("2026-11-01T12:00:00Z")), false);
});

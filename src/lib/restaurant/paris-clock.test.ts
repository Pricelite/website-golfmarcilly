import assert from "node:assert/strict";
import test from "node:test";

import { getParisTime } from "./paris-clock";

test("restaurant clock follows Paris summer and winter time changes", () => {
  assert.deepEqual(getParisTime(new Date("2026-03-29T00:59:59Z")), {
    hours: 1, minutes: 59, seconds: 59, label: "01:59:59",
  });
  assert.deepEqual(getParisTime(new Date("2026-03-29T01:00:00Z")), {
    hours: 3, minutes: 0, seconds: 0, label: "03:00:00",
  });
  assert.deepEqual(getParisTime(new Date("2026-10-25T00:59:59Z")), {
    hours: 2, minutes: 59, seconds: 59, label: "02:59:59",
  });
  assert.deepEqual(getParisTime(new Date("2026-10-25T01:00:00Z")), {
    hours: 2, minutes: 0, seconds: 0, label: "02:00:00",
  });
});

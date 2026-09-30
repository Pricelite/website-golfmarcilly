import assert from "node:assert/strict";
import test from "node:test";

import { parisDateKey } from "./daily-menu";

test("daily menu date follows Paris midnight, including the summer offset", () => {
  assert.equal(parisDateKey(new Date("2026-09-29T21:59:59Z")), "2026-09-29");
  assert.equal(parisDateKey(new Date("2026-09-29T22:00:00Z")), "2026-09-30");
  assert.equal(parisDateKey(new Date("2026-12-29T22:59:59Z")), "2026-12-29");
  assert.equal(parisDateKey(new Date("2026-12-29T23:00:00Z")), "2026-12-30");
});

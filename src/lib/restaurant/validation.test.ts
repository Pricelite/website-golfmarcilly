import assert from "node:assert/strict";
import test from "node:test";
import { getRestaurantDays, parseReservationPayload } from "./validation";

const now = new Date("2026-09-16T09:00:00Z");
const valid = { day: "2026-09-16", time: "12:00", name: "Client test", email: "test@example.com", partySize: 2 };

test("restaurant accepts a complete request and rejects invalid input", () => {
  assert.equal(parseReservationPayload(valid, now).ok, true);
  for (const changes of [
    { day: "2026-02-30" }, { day: "2026-09-15" }, { day: "2026-09-23" },
    { time: "19:00" }, { time: "12:15" }, { email: "invalid" },
    { partySize: "2abc" }, { partySize: 2.5 }, { partySize: 0 }, { partySize: 31 },
    { partySize: true }, { partySize: [2] }, { name: " " }, { message: "x".repeat(1201) },
  ]) {
    assert.equal(parseReservationPayload({ ...valid, ...changes }, now).ok, false, JSON.stringify(changes));
  }
});

test("restaurant enforces thirty minutes notice in Paris", () => {
  assert.equal(parseReservationPayload(valid, new Date("2026-09-16T09:30:00Z")).ok, true);
  assert.equal(parseReservationPayload(valid, new Date("2026-09-16T09:31:00Z")).ok, false);
});

test("restaurant dates follow Paris midnight and daylight saving changes", () => {
  const dates = getRestaurantDays(new Date("2026-10-24T22:30:00Z"));
  assert.equal(dates[0], "2026-10-25");
  assert.equal(dates[6], "2026-10-31");
  assert.equal(new Set(dates).size, 7);
});

import assert from "node:assert/strict";
import test from "node:test";
import { blackFriday2026ClosesAt, blackFriday2026OpensAt } from "../data/offers";
import { formatOfferCountdown, getBlackFriday2026Timing } from "./offer-campaign";

test("Black Friday opens at the scheduled instant and stops exactly at the deadline", () => {
  const start = Date.parse(blackFriday2026OpensAt);
  const end = Date.parse(blackFriday2026ClosesAt);
  assert.deepEqual(getBlackFriday2026Timing(start - 1), { phase: "upcoming", remainingMs: 1 });
  assert.deepEqual(getBlackFriday2026Timing(start), { phase: "active", remainingMs: end - start });
  assert.deepEqual(getBlackFriday2026Timing(end - 1), { phase: "active", remainingMs: 1 });
  assert.deepEqual(getBlackFriday2026Timing(end), { phase: "ended", remainingMs: 0 });
  assert.deepEqual(getBlackFriday2026Timing(end + 60_000), { phase: "ended", remainingMs: 0 });
});

test("the deadline is Monday 30 November 2026 at 20:00 in Paris", () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris", weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(blackFriday2026ClosesAt));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(value => value.type === type)?.value;
  assert.deepEqual([part("weekday"), part("day"), part("month"), part("year"), part("hour"), part("minute")], ["Monday", "30", "11", "2026", "20", "00"]);
});

test("countdown rounds up the final second and never displays negative time", () => {
  assert.equal(formatOfferCountdown(90_061_000), "1 j 01 h 01 min 01 s");
  assert.equal(formatOfferCountdown(1), "0 j 00 h 00 min 01 s");
  assert.equal(formatOfferCountdown(-1), "0 j 00 h 00 min 00 s");
});

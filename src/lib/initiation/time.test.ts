import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAllowedWeekendSlots,
  getAllowedBookingDateKeys,
  isAllowedBookingSlot,
  isWeekendBookingDate,
} from "./time";

test("getAllowedBookingDateKeys returns 8 dates including today", () => {
  const keys = getAllowedBookingDateKeys(new Date("2026-07-29T10:00:00.000Z"));
  assert.equal(keys.length, 8);
  assert.equal(keys[0], "2026-07-29");
  assert.equal(keys.at(-1), "2026-08-05");
});

test("buildAllowedWeekendSlots only returns configured weekend slots", () => {
  const slots = buildAllowedWeekendSlots(new Date("2026-07-29T10:00:00.000Z"));
  assert.ok(slots.length > 0);
  assert.ok(slots.every((slot) => isWeekendBookingDate(slot.date)));
  assert.ok(
    slots.every((slot) =>
      isAllowedBookingSlot(
        slot.date,
        slot.startTime,
        slot.endTime,
        new Date("2026-07-29T10:00:00.000Z")
      )
    )
  );
});

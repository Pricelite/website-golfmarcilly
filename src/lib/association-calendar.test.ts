import assert from "node:assert/strict";
import test from "node:test";
import { monthDays, eventsOnDay, eventsInMonth } from "./association-calendar";
import { associationEvents } from "../data/association-events";

test("calendar starts on Monday and handles leap years and year boundaries", () => {
  assert.deepEqual(monthDays(2026, 8).slice(0, 3), [null, "2026-09-01", "2026-09-02"]);
  assert.equal(monthDays(2026, 1).filter(Boolean).length, 28);
  assert.equal(monthDays(2028, 1).filter(Boolean).length, 29);
  assert.equal(monthDays(2026, 2).length, 42);
  assert.equal(monthDays(2027, 0).filter(Boolean)[0], "2027-01-01");
});

test("multi-day events appear on each day inclusively but count once per month", () => {
  const events = [{ id: "test", title: "Test", start: "2026-12-31", end: "2027-01-02" }];
  assert.equal(eventsOnDay(events, "2027-01-02").length, 1);
  assert.equal(eventsOnDay(events, "2027-01-03").length, 0);
  assert.equal(eventsInMonth(events, 2026, 11).length, 1);
  assert.equal(eventsInMonth(events, 2027, 0).length, 1);
  assert.equal(eventsInMonth(events, 2027, 1).length, 0);
  for (const day of ["2026-09-18", "2026-09-19", "2026-09-20"]) {
    assert.ok(eventsOnDay(associationEvents, day).some(event => event.title === "Grand Prix Jeunes Marcilly"));
  }
  assert.equal(eventsInMonth(associationEvents, 2026, 8).length, 4);
});

test("published programme has valid unique dates and preserves private and provisional notices", () => {
  assert.equal(new Set(associationEvents.map(event => event.id)).size, associationEvents.length);
  for (const event of associationEvents) {
    assert.equal(new Date(`${event.start}T12:00:00Z`).toISOString().slice(0, 10), event.start);
    if (event.end) assert.ok(event.end >= event.start);
  }
  assert.equal(eventsOnDay(associationEvents, "2026-09-11")[0].status, "private");
  assert.equal(eventsOnDay(associationEvents, "2026-10-18")[0].status, "provisional");
  assert.equal(eventsInMonth(associationEvents, 2026, 7).length, 0);
});

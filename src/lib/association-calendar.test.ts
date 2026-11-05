import assert from "node:assert/strict";
import test from "node:test";
import { calendarDefaultDate, monthDays, eventsOnDay, eventsInMonth, eventsInWeek, formatCalendarWeek, isPastEvent, shiftCalendarDate, upcomingCompetitions, weekDays } from "./association-calendar";
import { associationEvents, associationEvents2027 } from "../data/association-events";

test("events become past only after their inclusive final day", () => {
  const single = { id: "single", title: "Coupe", start: "2026-09-16" };
  assert.equal(isPastEvent(single, "2026-09-15"), false);
  assert.equal(isPastEvent(single, "2026-09-16"), false);
  assert.equal(isPastEvent(single, "2026-09-17"), true);
  const multiple = { ...single, start: "2026-12-31", end: "2027-01-02" };
  assert.equal(isPastEvent(multiple, "2027-01-01"), false);
  assert.equal(isPastEvent(multiple, "2027-01-02"), false);
  assert.equal(isPastEvent(multiple, "2027-01-03"), true);
});

test("next competition shortcut ignores context and empty slots", () => {
  const events = [
    { id: "holiday", title: "Jour férié", start: "2027-01-01", category: "holiday" as const },
    { id: "free", title: "Créneau à définir", start: "2027-02-01", category: "open_slot" as const },
    { id: "cup", title: "Coupe", start: "2027-03-07", category: "competition" as const },
  ];
  assert.deepEqual(upcomingCompetitions(events, "2026-10-10").map(event => event.id), ["cup"]);
});

test("calendar opens on the current Monday through Sunday even when that week has no events", () => {
  assert.equal(calendarDefaultDate("2026-11-05"), "2026-11-02");
  assert.equal(calendarDefaultDate("2026-11-08"), "2026-11-02");
  assert.equal(calendarDefaultDate("2026-11-09"), "2026-11-09");
  assert.deepEqual(weekDays("2026-11-05"), ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-08"]);
  assert.deepEqual(eventsInWeek(associationEvents, "2026-11-05"), []);
});

test("weekly navigation crosses months, years, leap days and daylight-saving changes", () => {
  assert.deepEqual(weekDays("2027-01-01"), ["2026-12-28", "2026-12-29", "2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02", "2027-01-03"]);
  for (const [start, next] of [["2026-12-28", "2027-01-04"], ["2028-02-28", "2028-03-06"], ["2027-03-22", "2027-03-29"], ["2026-10-19", "2026-10-26"]]) {
    assert.equal(shiftCalendarDate(start, 7), next);
    assert.equal(shiftCalendarDate(next, -7), start);
  }
  assert.ok(weekDays("2028-02-29").includes("2028-02-29"));
  assert.equal(formatCalendarWeek("2026-11-05"), "Du 2 au 8 novembre 2026");
  assert.equal(formatCalendarWeek("2027-01-01"), "Du 28 décembre 2026 au 3 janvier 2027");
});

test("weekly events include overlaps and both boundaries, counting multi-day events once", () => {
  const events = [
    { id: "before", title: "Avant", start: "2026-12-27" },
    { id: "monday", title: "Lundi", start: "2026-12-28" },
    { id: "overlap", title: "Vacances", start: "2026-12-20", end: "2027-01-05", category: "vacation" as const },
    { id: "sunday", title: "Dimanche", start: "2027-01-03" },
    { id: "after", title: "Après", start: "2027-01-04" },
  ];
  assert.deepEqual(eventsInWeek(events, "2027-01-01").map(event => event.id), ["overlap", "monday", "sunday"]);
});

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
  assert.equal(eventsInMonth(associationEvents, 2026, 8).length, 0);
});

test("competitions appear before calendar markers on a shared day", () => {
  const events = [
    { id: "holiday", title: "Vacances", start: "2027-05-01", end: "2027-05-10", category: "vacation" as const },
    { id: "competition", title: "Coupe", start: "2027-05-05", category: "competition" as const },
  ];
  assert.deepEqual(eventsOnDay(events, "2027-05-05").map(event => event.id), ["competition", "holiday"]);
});

test("published programme contains only valid unique 2027 dates", () => {
  assert.equal(new Set(associationEvents.map(event => event.id)).size, associationEvents.length);
  for (const event of associationEvents) {
    assert.equal(new Date(`${event.start}T12:00:00Z`).toISOString().slice(0, 10), event.start);
    assert.ok(event.start.startsWith("2027-"));
    if (event.end) assert.ok(event.end >= event.start);
  }
  assert.equal(associationEvents.length, 106);
  assert.equal(associationEvents.filter(event => ["holiday", "vacation", "celebration"].includes(event.category ?? "")).length, 33);
  assert.equal(eventsOnDay(associationEvents, "2027-03-28").map(event => event.title).includes("Pâques"), true);
  assert.equal(eventsOnDay(associationEvents, "2027-03-28").map(event => event.title).includes("Goltechnic"), false);
});

test("2027 owner agenda keeps named competitions, open dates and their publication statuses", () => {
  assert.equal(associationEvents2027.length, 73);
  assert.deepEqual(
    associationEvents2027.reduce<Record<string, number>>((counts, event) => {
      const status = event.status ?? "missing";
      counts[status] = (counts[status] ?? 0) + 1;
      return counts;
    }, {}),
    { unconfirmed: 29, provisional: 6, confirmed: 34, missing: 4 },
  );
  assert.deepEqual(associationEvents2027.filter(event => event.title === "Goltechnic").map(event => [event.start, event.status]), [["2027-03-21", "confirmed"]]);
  assert.equal(associationEvents2027.filter(event => event.title === "Coupe de Classement").length, 33);
  assert.ok(associationEvents2027.filter(event => event.title === "Coupe de Classement").every(event => event.status === "confirmed"));
  assert.deepEqual(associationEvents2027.filter(event => event.title === "Coupe CITYA").map(event => [event.start, event.status]), [["2027-04-11", "provisional"]]);
  assert.ok(associationEvents2027.every(event => event.start.startsWith("2027-") && !event.note?.includes("Référence 2026")));
  assert.equal(associationEvents2027.filter(event => event.title === "Créneau à définir").length, 26);
  assert.equal(new Set(associationEvents2027.map(event => event.id)).size, 73);
  assert.equal(eventsOnDay(associationEvents, "2027-10-03")[0].title, "Coupe Octobre Rose");
});

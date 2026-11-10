import assert from "node:assert/strict";
import test from "node:test";
import { calendarDefaultDate, monthDays, eventsOnDay, eventsInMonth, isPastEvent, upcomingCompetitions } from "./association-calendar";
import { associationCalendar2027, associationClubEvents, associationEvents, associationEvents2027 } from "../data/association-events";

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

test("calendar opens on the current month even if the next competition is months away", () => {
  const events = [
    { id: "holiday", title: "Jour férié", start: "2027-01-01", category: "holiday" as const },
    { id: "free", title: "Créneau à définir", start: "2027-02-01", category: "open_slot" as const },
    { id: "cup", title: "Coupe", start: "2027-03-07", category: "competition" as const },
  ];
  assert.equal(calendarDefaultDate("2026-10-10"), "2026-10-10");
  assert.equal(calendarDefaultDate("2026-11-05"), "2026-11-05");
  assert.equal(calendarDefaultDate("2027-03-01"), "2027-03-01");
  assert.deepEqual(upcomingCompetitions(events, "2026-10-10").map(event => event.id), ["cup"]);
  assert.equal(calendarDefaultDate("2027-04-12"), "2027-04-12");
  assert.equal(calendarDefaultDate("2027-01-01"), "2027-01-01");
  assert.equal(calendarDefaultDate("2027-04-12"), "2027-04-12");
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

test("original 2027 programme keeps valid unique dates and its 33 context markers", () => {
  assert.equal(new Set(associationEvents.map(event => event.id)).size, associationEvents.length);
  for (const event of associationCalendar2027) {
    assert.equal(new Date(`${event.start}T12:00:00Z`).toISOString().slice(0, 10), event.start);
    assert.ok(event.start.startsWith("2027-"));
    if (event.end) assert.ok(event.end >= event.start);
  }
  assert.equal(associationCalendar2027.length, 107);
  assert.equal(associationEvents.filter(event => ["holiday", "vacation", "celebration"].includes(event.category ?? "")).length, 33);
  assert.equal(eventsOnDay(associationEvents, "2027-03-28").map(event => event.title).includes("Pâques"), true);
  assert.equal(eventsOnDay(associationEvents, "2027-03-28").map(event => event.title).includes("Goltechnic"), true);
});

test("owner additions contain nine Thursdays, fourteen first Fridays and the two confirmed November competitions", () => {
  const seniors = associationClubEvents.filter(event => event.title === "Animation seniors");
  const women = associationClubEvents.filter(event => event.title === "Conviviales femmes");
  assert.equal(seniors.length, 9);
  assert.equal(seniors[0].start, "2026-11-05");
  assert.equal(seniors.at(-1)?.start, "2026-12-31");
  assert.ok(seniors.every(event => new Date(`${event.start}T12:00:00Z`).getUTCDay() === 4));
  assert.equal(women.length, 14);
  assert.equal(new Set(women.map(event => event.start.slice(0, 7))).size, 14);
  assert.equal(women[0].start, "2026-11-06");
  assert.equal(women.at(-1)?.start, "2027-12-03");
  assert.ok(women.every(event => new Date(`${event.start}T12:00:00Z`).getUTCDay() === 5 && Number(event.start.slice(-2)) <= 7));
  assert.equal(associationClubEvents.length, 25);
  assert.ok(associationClubEvents.every(event => event.status === "confirmed" && event.category === "competition"));
  assert.deepEqual(associationClubEvents.filter(event => event.id.startsWith("2026-")).map(event => [event.start, event.title, event.note]), [
    ["2026-11-08", "Brégent et La Bergerie", "Scramble à 4."],
    ["2026-11-22", "Coupe Beaujolais", "Scramble à 2."],
  ]);
  assert.equal(new Set(associationEvents.map(event => event.id)).size, associationEvents.length);
});

test("2027 owner agenda keeps named competitions, open dates and their publication statuses", () => {
  assert.equal(associationEvents2027.length, 74);
  assert.deepEqual(
    associationEvents2027.reduce<Record<string, number>>((counts, event) => {
      const status = event.status ?? "missing";
      counts[status] = (counts[status] ?? 0) + 1;
      return counts;
    }, {}),
    { unconfirmed: 63, provisional: 7, confirmed: 4 },
  );
  assert.deepEqual(associationEvents2027.filter(event => event.title === "Goltechnic").map(event => [event.start, event.status]), [["2027-03-21", "provisional"], ["2027-03-28", "provisional"]]);
  assert.equal(associationEvents2027.filter(event => event.title === "Coupe de Classement").length, 33);
  assert.ok(associationEvents2027.filter(event => event.title === "Coupe de Classement").every(event => event.status === "unconfirmed"));
  assert.deepEqual(associationEvents2027.filter(event => event.id === "agenda-2027-source-12").map(event => [event.title, event.status]), [["Créneau à définir", "unconfirmed"]]);
  assert.ok(associationEvents2027.every(event => event.start.startsWith("2027-")));
  assert.equal(associationEvents2027.filter(event => event.title === "Créneau à définir").length, 27);
  assert.equal(new Set(associationEvents2027.map(event => event.id)).size, 74);
  assert.deepEqual(associationEvents2027.filter(event => event.gameFormat).map(event => [event.start, event.gameFormat]), [["2027-10-03", "scramble_2"], ["2027-11-07", "scramble_4"], ["2027-11-21", "scramble_2"]]);
  assert.equal(associationEvents.filter(event => event.start.startsWith("2027-")).length, 107);
  assert.equal(associationEvents.filter(event => event.start.startsWith("2026-")).length, 13);
  assert.equal(eventsOnDay(associationEvents, "2027-10-03")[0].title, "Coupe Octobre Rose");
});

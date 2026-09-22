import assert from "node:assert/strict";
import test from "node:test";
import { parseInitiationOptions } from "./initiation/calendar-options";

const calendar = (...events: string[]) => ["BEGIN:VCALENDAR", "VERSION:2.0", ...events, "END:VCALENDAR"].join("\r\n");
const event = (id: string, properties: string[]) => ["BEGIN:VEVENT", `UID:${id}`, ...properties, "END:VEVENT"].join("\r\n");

test("initiation choices only expose future empty discovery sessions, in Paris time and without duplicates", async () => {
  const base = ["DTSTART:20261003T090000Z", "DTEND:20261003T100000Z"];
  const result = await parseInitiationOptions(calendar(
    event("available", [...base, "SUMMARY:DEC - VIDE (Professeur)"]),
    event("duplicate", [...base, "SUMMARY:DEC-VIDE"]),
    event("private", [...base, "SUMMARY:COM 2000"]),
    event("booked", [...base, "SUMMARY:DEC - 4 personnes"]),
    event("cancelled", [...base, "SUMMARY:DEC - VIDE", "STATUS:CANCELLED"]),
    event("past", ["DTSTART:20260901T090000Z", "SUMMARY:DEC - VIDE"]),
    event("all-day", ["DTSTART;VALUE=DATE:20261004", "SUMMARY:DEC - VIDE"]),
  ), new Date("2026-09-21T10:00:00Z"));
  assert.deepEqual(result, [{ date: "2026-10-03", time: "11:00" }]);
});

test("recurrence exceptions, private replacements and winter clock changes are respected", async () => {
  const result = await parseInitiationOptions(calendar(
    event("weekly", ["DTSTART;TZID=Europe/Paris:20261003T110000", "DTEND;TZID=Europe/Paris:20261003T120000", "RRULE:FREQ=WEEKLY;COUNT=5", "EXDATE;TZID=Europe/Paris:20261010T110000", "SUMMARY:DEC - vide"]),
    event("weekly", ["RECURRENCE-ID;TZID=Europe/Paris:20261017T110000", "DTSTART;TZID=Europe/Paris:20261017T110000", "DTEND;TZID=Europe/Paris:20261017T120000", "SUMMARY:Groupe prive"]),
    event("weekly", ["RECURRENCE-ID;TZID=Europe/Paris:20261024T110000", "DTSTART;TZID=Europe/Paris:20261024T110000", "DTEND;TZID=Europe/Paris:20261024T120000", "SUMMARY:DEC - VIDE", "STATUS:CANCELLED"]),
  ), new Date("2026-10-01T00:00:00Z"));
  assert.deepEqual(result, [{ date: "2026-10-03", time: "11:00" }, { date: "2026-10-31", time: "11:00" }]);
});

test("an inaccessible feed is not treated as an empty agenda", async () => {
  await assert.rejects(() => parseInitiationOptions("<html>Not found</html>"));
});

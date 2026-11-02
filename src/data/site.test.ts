import assert from "node:assert/strict";
import test from "node:test";
import { getGolfOpeningHours, getGolfOpeningSchedule } from "./site";

test("les horaires annoncés prennent effet le 26 novembre, selon l'heure de Paris", () => {
  const beforeParisMidnight = new Date("2026-11-25T22:59:59Z");
  const afterParisMidnight = new Date("2026-11-25T23:00:00Z");

  assert.equal(getGolfOpeningSchedule(beforeParisMidnight)[0].hours, "de 8 h 30 à 19 h");
  assert.equal(getGolfOpeningSchedule(beforeParisMidnight)[1].hours, "de 8 h à 20 h");
  assert.equal(getGolfOpeningSchedule(afterParisMidnight)[0].hours, "de 9 h à 18 h");
  assert.equal(getGolfOpeningSchedule(afterParisMidnight)[1].hours, "de 9 h à 19 h");
  assert.match(getGolfOpeningHours(afterParisMidnight), /Samedi et dimanche de 9 h à 19 h/);
});

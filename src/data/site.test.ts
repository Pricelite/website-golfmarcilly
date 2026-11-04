import assert from "node:assert/strict";
import test from "node:test";
import { getGolfOpeningHours, getGolfOpeningSchedule } from "./site";

test("les horaires d'hiver s'appliquent du 1er novembre au 10 mars inclus, chaque année à Paris", () => {
  const summer = ["de 8 h 30 à 19 h", "de 8 h à 20 h"];
  const winter = ["de 9 h à 18 h", "de 9 h à 19 h"];
  const hours = (date: string) => getGolfOpeningSchedule(new Date(date)).map(slot => slot.hours);

  assert.deepEqual(hours("2026-10-31T22:59:59Z"), summer);
  assert.deepEqual(hours("2026-10-31T23:00:00Z"), winter);
  assert.deepEqual(hours("2027-03-10T22:59:59Z"), winter);
  assert.deepEqual(hours("2027-03-10T23:00:00Z"), summer);
  assert.deepEqual(hours("2027-10-31T23:00:00Z"), winter);
  assert.match(getGolfOpeningHours(new Date("2026-11-04T12:00:00Z")), /Samedi et dimanche de 9 h à 19 h/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { getGolfOpeningHours, getGolfOpeningSchedule } from "./site";

test("les horaires d'hiver s'appliquent du 1er novembre au 10 mars inclus, chaque année à Paris", () => {
  const summer = ["08h30 - 19h00", "08h00 - 20h00"];
  const winter = ["09h00 - 18h00", "09h00 - 19h00"];
  const hours = (date: string) => getGolfOpeningSchedule(new Date(date)).map(slot => slot.hours);

  assert.deepEqual(hours("2026-10-31T22:59:59Z"), summer);
  assert.deepEqual(hours("2026-10-31T23:00:00Z"), winter);
  assert.deepEqual(hours("2027-03-10T22:59:59Z"), winter);
  assert.deepEqual(hours("2027-03-10T23:00:00Z"), summer);
  assert.deepEqual(hours("2027-10-31T23:00:00Z"), winter);
  assert.match(getGolfOpeningHours(new Date("2026-11-04T12:00:00Z")), /Samedi et dimanche : 09h00 - 19h00/);
});

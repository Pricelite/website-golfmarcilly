import assert from "node:assert/strict";
import test from "node:test";

import { normalizeDailyMenuName, parseDailyMenu, validDailyMenuDate } from "./daily-menu-validation";

const choice = (name: string, price = "9 €") => ({ name, price });
const valid = { date: "2026-09-30", starters: [choice("Œuf"), choice("Poireaux"), choice("Saumon")], mains: [choice("Burger"), choice("Poisson"), choice("Volaille")], desserts: [choice("Cookie"), choice("Tarte"), choice("Riz au lait")] };

test("daily menu accepts between one and twelve distinct choices in each category", () => {
  assert.deepEqual(parseDailyMenu(valid), { ok: true, menu: valid });
  assert.equal(parseDailyMenu({ ...valid, mains: [choice("Burger"), choice("Poisson")] }).ok, true);
  assert.equal(parseDailyMenu({ ...valid, mains: [] }).ok, false);
  assert.equal(parseDailyMenu({ ...valid, mains: Array.from({ length: 13 }, (_, index) => choice(`Plat ${index}`)) }).ok, false);
  assert.equal(parseDailyMenu({ ...valid, starters: [choice("Œuf"), choice(" œuf "), choice("Saumon")] }).ok, false);
  assert.equal(parseDailyMenu({ ...valid, desserts: [choice("Cookie"), choice("Tarte"), choice("x".repeat(121))] }).ok, false);
  assert.equal(parseDailyMenu({ ...valid, desserts: [choice("Cookie"), choice("Tarte"), choice("Riz", "prix libre")] }).ok, false);
});

test("daily menu rejects impossible dates and control characters", () => {
  assert.equal(validDailyMenuDate("2026-02-29"), false);
  assert.equal(validDailyMenuDate("2028-02-29"), true);
  assert.equal(validDailyMenuDate("0000-01-01"), false);
  assert.equal(parseDailyMenu({ ...valid, date: "2026-02-29" }).ok, false);
  assert.equal(parseDailyMenu({ ...valid, starters: [choice("Œuf\nmalveillant"), choice("Poireaux"), choice("Saumon")] }).ok, false);
});

test("daily menu standardizes common spelling, punctuation and prices before sorting", () => {
  const parsed = parseDailyMenu({
    ...valid,
    starters: [choice("  creme Brulée.  ", "9.5"), choice("Salade de Chevre chaud", "8€"), choice("Terrine Maison", "8,5")],
  });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.deepEqual(parsed.menu.starters, [
    { name: "Salade de chèvre chaud", price: "8 €" },
    { name: "Terrine maison", price: "8,50 €" },
    { name: "Crème brûlée", price: "9,50 €" },
  ]);
  assert.equal(normalizeDailyMenuName("assiette 3 Saumons,servie chaude."), "Assiette 3 saumons, servie chaude");
  assert.equal(normalizeDailyMenuName("tarte d'  automne :creme Brulée"), "Tarte d’automne : crème brûlée");
});

import assert from "node:assert/strict";
import test from "node:test";
import { getPricingSections, getPricingYear } from "./pricing";

test("the 2027 price list starts at midnight in Paris on 1 January", () => {
  const before = new Date("2026-12-31T22:59:59.999Z");
  const after = new Date("2026-12-31T23:00:00.000Z");
  assert.equal(getPricingYear(before), 2026);
  assert.equal(getPricingYear(after), 2027);
  assert.equal(new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", dateStyle: "short", timeStyle: "short" }).format(after), "01/01/2027 00:00");
  assert.equal(getPricingSections(before).find(section => section.id === "abonnements")?.rows[0].values[1], "384 €*");
  assert.equal(getPricingSections(after).find(section => section.id === "abonnements")?.rows[0].values[0], "389 €*");
});

test("the 2027 tables have one price per column", () => {
  for (const section of getPricingSections(new Date("2027-01-01T00:00:00Z"))) {
    assert.equal(section.year, 2027, section.id);
    for (const row of section.rows) assert.equal(row.values.length, section.columns.length, `${section.id}: ${row.label}`);
  }
});

test("the posted 2027 seasonal prices and membership terms are preserved", () => {
  const sections = getPricingSections(new Date("2027-01-01T00:00:00Z"));
  const byId = (id: string) => sections.find(section => section.id === id)!;
  assert.deepEqual(byId("grand-parcours").rows[1].values, ["32 €", "39 €", "49 €", "59 €"]);
  assert.deepEqual(byId("grand-parcours-basse-saison").rows[2].values, ["18 €", "22 €", "25 €", "29 €"]);
  assert.deepEqual(byId("carnets-green-fees").rows[3].values, ["450 €", "290 €"]);
  assert.deepEqual(byId("abonnements-temps-plein").rows[5].values, ["2 997 €*"]);
  assert.deepEqual(byId("abonnements-temps-plein").footnotes, ["* Remise accordée pour un paiement comptant."]);
});

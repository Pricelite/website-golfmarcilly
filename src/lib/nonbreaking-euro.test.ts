import assert from "node:assert/strict";
import test from "node:test";
import { nonbreakingEuro } from "./nonbreaking-euro";

test("les tarifs affichés ont deux décimales sans changer le montant", () => {
  assert.equal(nonbreakingEuro("15 €"), "15,00\u00a0€");
  assert.equal(nonbreakingEuro("9,5 €"), "9,50\u00a0€");
  assert.equal(nonbreakingEuro("24,90 €"), "24,90\u00a0€");
  assert.equal(nonbreakingEuro("15.00€"), "15,00\u00a0€");
  assert.equal(nonbreakingEuro("1 080 €*"), "1 080,00\u00a0€*");
  assert.equal(nonbreakingEuro("de 2 100 € à 4 000 € HT"), "de 2 100,00\u00a0€ à 4 000,00\u00a0€ HT");
  assert.equal(nonbreakingEuro("9 trous · 10 €"), "9 trous · 10,00\u00a0€");
});

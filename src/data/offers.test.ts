import assert from "node:assert/strict";
import test from "node:test";
import { getActiveSiteOffers, getSiteOfferBySlug } from "./offers";

test("September 2026 offer expires after the last Paris day of September", () => {
  const lastEvening = new Date("2026-09-30T21:59:59Z");
  const firstOctober = new Date("2026-09-30T22:00:00Z");
  assert.ok(getSiteOfferBySlug("tarifs-septembre", lastEvening));
  assert.equal(getSiteOfferBySlug("tarifs-septembre", firstOctober), undefined);
  assert.ok(!getActiveSiteOffers(firstOctober).some(offer => offer.slug === "tarifs-septembre"));
  assert.ok(getSiteOfferBySlug("abonnement-900", firstOctober));
});

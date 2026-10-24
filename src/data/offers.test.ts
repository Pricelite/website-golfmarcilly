import assert from "node:assert/strict";
import test from "node:test";
import { getActiveSiteOffers, getSiteOfferBySlug } from "./offers";

test("withdrawn offers are no longer published or accessible by slug", () => {
  const lastEvening = new Date("2026-09-30T21:59:59Z");
  const firstOctober = new Date("2026-09-30T22:00:00Z");
  assert.equal(getSiteOfferBySlug("tarifs-septembre", lastEvening), undefined);
  assert.equal(getSiteOfferBySlug("tarifs-septembre", firstOctober), undefined);
  assert.ok(!getActiveSiteOffers(firstOctober).some(offer => offer.slug === "tarifs-septembre"));
  assert.equal(getSiteOfferBySlug("abonnement-900", firstOctober), undefined);
  assert.deepEqual(getActiveSiteOffers(), []);
});

import assert from "node:assert/strict";
import test from "node:test";
import { visibleHomeAd, type HomeAd } from "./home-ads";

const ad: HomeAd = {
  advertiser: "Exemple",
  image: "/advertisers/exemple.webp",
  imageAlt: "Logo Exemple",
  url: "https://example.com",
  startsOn: "2026-11-01",
  endsOn: "2026-11-30",
};

test("une publicité respecte ses dates de début et de fin incluses", () => {
  assert.equal(visibleHomeAd(ad, "2026-10-31"), null);
  assert.equal(visibleHomeAd(ad, "2026-11-01"), ad);
  assert.equal(visibleHomeAd(ad, "2026-11-30"), ad);
  assert.equal(visibleHomeAd(ad, "2026-12-01"), null);
  assert.equal(visibleHomeAd(null, "2026-11-15"), null);
});

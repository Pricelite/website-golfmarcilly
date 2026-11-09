import assert from "node:assert/strict";
import test from "node:test";
import { defaultManagedHomeAds, managedAdsForSide } from "../data/home-ads";
import { adImageMime, parseManagedHomeAd, validHomeAdId } from "./home-ads-validation";
import { prepareHomeAdImage } from "./home-ad-image";
import sharp from "sharp";

const valid = { advertiser: "Partenaire", image: "/ads/horaires-hiver.svg", imageAlt: "Affiche du partenaire", side: "left", enabled: true, position: 10 };

test("announcements keep the existing visuals and filter dates inclusively for each side", () => {
  const defaults = defaultManagedHomeAds();
  assert.equal(defaults.length, 2);
  assert.equal(managedAdsForSide(defaults, "left", "2026-11-13").length, 1);
  assert.equal(managedAdsForSide(defaults, "left", "2026-11-14").length, 0);
  const ads = defaults.map(ad => ({ ...ad, side: "both" as const, startsOn: "2026-11-10", endsOn: "2026-11-12" }));
  assert.equal(managedAdsForSide(ads, "right", "2026-11-09").length, 0);
  assert.equal(managedAdsForSide(ads, "right", "2026-11-10").length, 2);
  assert.equal(managedAdsForSide(ads, "left", "2026-11-12").length, 2);
  assert.equal(managedAdsForSide(ads.map(ad => ({ ...ad, enabled: false })), "left", "2026-11-12").length, 0);
  assert.equal(managedAdsForSide(ads, "left", "2026-11-13").length, 0);
});
test("advertising input validates link protocols, lengths, dates and activation", () => {
  assert.equal(parseManagedHomeAd({ ...valid, url: "https://example.com/offre?source=golf" }).ok, true);
  assert.equal(parseManagedHomeAd({ ...valid, url: "/contact#reservation", startsOn: "2028-02-29" }).ok, true);
  for (const patch of [
    { url: "javascript:alert(1)" }, { url: "//evil.example" }, { url: "/\\evil.example" },
    { url: "https://name:password@example.com" }, { url: "https://example.com\n/" },
    { startsOn: "2027-02-29" }, { startsOn: "2026-11-12", endsOn: "2026-11-11" },
    { advertiser: " " }, { imageAlt: "x".repeat(301) }, { caption: "x".repeat(241) },
    { side: "unknown" }, { position: -1 }, { position: 0.5 }, { enabled: "true" }, { kind: "unknown" },
    { image: "https://example.com/tracking.png" }, { image: "/ads/../../secret" },
  ]) assert.equal(parseManagedHomeAd({ ...valid, ...patch }).ok, false, JSON.stringify(patch));
});
test("uploaded images and record identifiers cannot escape their own storage paths", () => {
  assert.equal(validHomeAdId("default-left-0"), true);
  assert.equal(validHomeAdId("8eb8b5ed-41fb-4c5a-86ca-41a7d7c7ee1e"), true);
  for (const id of ["../secrets", "file.json", "default-left-0/../../a", "", null]) assert.equal(validHomeAdId(id), false);
  assert.equal(parseManagedHomeAd({ ...valid, image: "/api/home-ad-images/8eb8b5ed-41fb-4c5a-86ca-41a7d7c7ee1e" }).ok, true);
});
test("announcements are ordered independently of their original storage order", () => {
  const defaults = defaultManagedHomeAds().map(ad => ({ ...ad, side: "both" as const, endsOn: undefined }));
  defaults[0].position = 20; defaults[1].position = 0;
  assert.deepEqual(managedAdsForSide(defaults, "right", "2026-11-09").map(ad => ad.id), [defaults[1].id, defaults[0].id]);
});
test("images are fully decoded, oriented and re-encoded without EXIF metadata", async () => {
  const source = await sharp({ create: { width: 80, height: 40, channels: 3, background: "#00543c" } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const result = await prepareHomeAdImage(source);
  const metadata = await sharp(result).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 40);
  assert.equal(metadata.height, 80);
  assert.equal(metadata.exif, undefined);
  assert.equal(adImageMime(result), "image/webp");
});
test("scripts, oversized files and corrupt image headers are rejected", async () => {
  assert.equal(adImageMime(new TextEncoder().encode('<svg onload="alert(1)"/>')), null);
  assert.equal(adImageMime(new Uint8Array(5_000_001)), null);
  await assert.rejects(prepareHomeAdImage(new Uint8Array([255,216,255,0,0,0,0,0])));
  await assert.rejects(prepareHomeAdImage(new TextEncoder().encode("not an image")));
});

import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "./sitemap";
import robots from "./robots";
import { siteOffers } from "../data/offers";
import { siteConfig } from "../data/site";
import { legalContent } from "../data/legal";
import { buildMetadata } from "../lib/metadata";
import { buildOrganizationSchema } from "../lib/schema";

test("sitemap includes editorial entry points and current offers, without transaction pages", () => {
  const urls = sitemap().map(item => item.url);
  assert.equal(new Set(urls).size, urls.length);
  for (const path of ["/je-debute-le-golf", "/reserver-un-cours", "/partenaires", ...siteOffers.map(offer => `/offres/${offer.slug}`)]) {
    assert.ok(urls.includes(new URL(path, siteConfig.url).href), path);
  }
  for (const url of urls) {
    assert.equal(new URL(url).origin, new URL(siteConfig.url).origin);
    assert.doesNotMatch(new URL(url).pathname, /^\/(api|admin|payment|initiation)(\/|$)/);
  }
  assert.equal(urls.includes(new URL("/mentions-legales", siteConfig.url).href), legalContent.reviewed);
});

test("canonical, social URL and robots point to the same public site", () => {
  const meta = buildMetadata({ title: "Test", description: "Test", path: "/payment/success", indexable: false });
  assert.equal(meta.alternates?.canonical, new URL("/payment/success", siteConfig.url).href);
  assert.equal(meta.openGraph?.url, meta.alternates?.canonical);
  assert.deepEqual(meta.robots, { index: false, follow: true });
  assert.equal(robots().sitemap, new URL("/sitemap.xml", siteConfig.url).href);
  assert.deepEqual(robots().rules, { userAgent: "*", allow: "/", disallow: "/api/" });
});

test("structured address separates street, postal code and country", () => {
  const address = buildOrganizationSchema().address;
  assert.equal(address.streetAddress, siteConfig.addressLine1);
  assert.equal(address.postalCode, "45240");
  assert.equal(address.addressCountry, "FR");
});

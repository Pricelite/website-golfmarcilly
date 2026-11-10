import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JsonLd } from "../components/ui/json-ld";
import { siteConfig } from "../data/site";
import { publicPageSeo } from "../data/seo";
import { buildMetadata } from "./metadata";
import { buildGolfOpeningHours, buildOrganizationSchema, buildRestaurantSchema, buildWebsiteSchema } from "./schema";

test("seasonal opening hours cover winter boundaries without overlapping seasons", () => {
  const hours = buildGolfOpeningHours(new Date("2026-11-09T12:00:00Z"));
  for (const [date, weekday, opens, closes] of [
    ["2026-03-10", "Tuesday", "09:00", "18:00"],
    ["2026-03-11", "Wednesday", "08:30", "19:00"],
    ["2026-10-31", "Saturday", "08:00", "20:00"],
    ["2026-11-01", "Sunday", "09:00", "19:00"],
    ["2027-03-10", "Wednesday", "09:00", "18:00"],
    ["2027-03-11", "Thursday", "08:30", "19:00"],
  ]) {
    const applicable = hours.filter(slot => slot.validFrom <= date && slot.validThrough >= date && slot.dayOfWeek.includes(`https://schema.org/${weekday}`));
    assert.equal(applicable.length, 1, date);
    assert.equal(applicable[0].opens, opens, date);
    assert.equal(applicable[0].closes, closes, date);
  }
  assert.equal(buildGolfOpeningHours(new Date("2026-12-31T23:30:00Z"))[0].validFrom, "2026-11-01", "year follows Paris time");
});

test("local schemas share the verified identity and distinguish restaurant service hours", () => {
  const golf = buildOrganizationSchema();
  const restaurant = buildRestaurantSchema();
  assert.equal(golf["@type"], "GolfCourse");
  assert.equal(golf.telephone, siteConfig.phoneHref);
  assert.equal(golf.url, "https://www.golfdemarcilly.com");
  assert.deepEqual(restaurant.address, golf.address);
  assert.equal(restaurant.containedInPlace["@id"], golf["@id"]);
  assert.equal(buildWebsiteSchema().publisher["@id"], golf["@id"]);
  assert.equal(restaurant.openingHoursSpecification.length, 6);
  assert.ok(!restaurant.openingHoursSpecification.some(slot => slot.dayOfWeek.endsWith("Tuesday")));
  assert.equal(restaurant.openingHoursSpecification.find(slot => slot.dayOfWeek.endsWith("Monday"))?.closes, "14:30");
  assert.equal(restaurant.openingHoursSpecification.find(slot => slot.dayOfWeek.endsWith("Sunday"))?.closes, "15:00");
  for (const schema of [golf, restaurant]) {
    assert.ok(!("aggregateRating" in schema));
    assert.ok(!("geo" in schema));
  }
});

test("primary page metadata has unique descriptions and canonical social URLs", () => {
  const pages = Object.values(publicPageSeo);
  assert.equal(new Set(pages.map(page => page.title)).size, 8);
  assert.equal(new Set(pages.map(page => page.description)).size, 8);
  for (const page of pages) {
    const metadata = buildMetadata(page);
    assert.equal(metadata.alternates?.canonical, new URL(page.path, siteConfig.url).href);
    assert.equal(metadata.openGraph?.url, metadata.alternates?.canonical);
    assert.deepEqual(metadata.robots, { index: true, follow: true });
  }
});

test("JSON-LD cannot close the script while preserving its data", () => {
  const data = { name: "</script><script>alert(1)</script>", description: "Golf & restaurant" };
  const html = renderToStaticMarkup(createElement(JsonLd, { data }));
  assert.equal((html.match(/<script/g) ?? []).length, 1);
  assert.deepEqual(JSON.parse(html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "")), data);
});

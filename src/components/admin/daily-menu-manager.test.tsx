import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DailyMenu } from "@/data/daily-menu";
import { DailyMenuManager } from "./daily-menu-manager";

test("a carried-over menu is shown as an unpublished editable card", () => {
  const menu: DailyMenu = {
    date: "2026-11-28",
    starters: [{ name: "Terrine du chef", price: "8 €" }],
    mains: [{ name: "Poulet rôti", price: "15 €" }],
    desserts: [{ name: "Tarte aux pommes", price: "7 €" }],
  };
  const html = renderToStaticMarkup(createElement(DailyMenuManager, {
    initialDate: menu.date,
    initialMenu: menu,
    initialPublished: false,
    initialCopiedFromDate: "2026-11-27",
    initialError: false,
  }));

  assert.match(html, /Carte du vendredi 27 novembre 2026 reprise pour cette date/);
  assert.match(html, /value="Poulet rôti"/);
  assert.match(html, /Publier la carte/);
  assert.doesNotMatch(html, /Terrine maison/);
});

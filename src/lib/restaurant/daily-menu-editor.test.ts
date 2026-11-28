import assert from "node:assert/strict";
import test from "node:test";
import type { DailyMenu } from "@/data/daily-menu";
import { prepareDailyMenuEditor } from "./daily-menu-editor";

const previous: DailyMenu = {
  date: "2026-11-27",
  starters: [{ name: "Terrine", price: "8 €" }],
  mains: [{ name: "Poulet", price: "15 €", dailySpecial: true }, { name: "Burger", price: "17 €" }],
  desserts: [{ name: "Tarte", price: "7 €" }],
};

test("an existing menu for the selected day wins over the previous menu", () => {
  const today = { ...previous, date: "2026-11-28" };
  assert.deepEqual(prepareDailyMenuEditor(today.date, today, previous), {
    menu: today, published: true, copiedFromDate: null,
  });
});

test("a new day reuses the last saved menu without carrying over the daily special", () => {
  const result = prepareDailyMenuEditor("2026-11-28", null, previous);
  assert.equal(result.published, false);
  assert.equal(result.copiedFromDate, "2026-11-27");
  assert.deepEqual(result.menu?.mains, [{ name: "Poulet", price: "15 €" }, { name: "Burger", price: "17 €" }]);
  assert.equal(result.menu?.date, "2026-11-28");
  assert.ok(result.menu);
  result.menu.starters[0].name = "Nouvelle entrée";
  assert.equal(previous.starters[0].name, "Terrine");
});

test("the example remains a fallback only when no menu has ever been saved", () => {
  assert.deepEqual(prepareDailyMenuEditor("2026-11-28", null, null), {
    menu: null, published: false, copiedFromDate: null,
  });
});

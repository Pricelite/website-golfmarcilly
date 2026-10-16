import assert from "node:assert/strict";
import test from "node:test";
import { parseConditionInput, visibleCondition } from "./site-conditions";
import { conditionItems } from "../data/site-conditions";

test("a closed condition requires a short reason", () => {
  const id = "grand-parcours-aller";
  assert.equal(parseConditionInput({ id, status: "closed", reason: "" }).ok, false);
  assert.equal(parseConditionInput({ id, status: "closed", reason: "x".repeat(241) }).ok, false);
  assert.equal(parseConditionInput({ id, status: "restricted", reason: "Restriction" }).ok, false);
  assert.equal(parseConditionInput({ id: "other", status: "open" }).ok, false);
  const parsed = parseConditionInput({ id, status: "closed", reason: "  Terrain détrempé  " });
  assert.ok(parsed.ok);
  assert.equal(parsed.condition.reason, "Terrain détrempé");
});

test("grand parcours, Pitch and Putt and Kaleka course have separate states", () => {
  assert.equal(conditionItems.length, 9);
  assert.deepEqual(conditionItems.filter(item => item.id.startsWith("grand-parcours-")).map(item => item.label),
    ["Grand parcours aller", "Grand parcours retour"]);
  assert.deepEqual(conditionItems.filter(item => item.id === "pitch-and-putt" || item.id === "kaleke").map(item => item.label),
    ["Pitch and Putt", "Kaleka course"]);
});

test("a manual closure lasts for its Paris day, then returns to open", () => {
  const condition = { id: "restaurant" as const, status: "closed" as const, reason: "Travaux", updatedAt: "2026-10-10T21:30:00Z" };
  assert.equal(visibleCondition(condition, new Date("2026-10-10T21:59:00Z")).status, "closed");
  assert.equal(visibleCondition(condition, new Date("2026-10-10T22:01:00Z")).status, "open");
  assert.equal(visibleCondition(condition, new Date("2026-10-10T22:01:00Z")).reason, null);
});

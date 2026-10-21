import assert from "node:assert/strict";
import test from "node:test";
import { parseConditionInput, visibleCondition } from "./site-conditions";
import { conditionItems, emptyConditions } from "../data/site-conditions";

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

test("grand parcours, Kaleka course aller and Kaleka course have separate states", () => {
  assert.equal(conditionItems.length, 9);
  assert.deepEqual(conditionItems.filter(item => item.id.startsWith("grand-parcours-")).map(item => item.label),
    ["Grand parcours aller", "Grand parcours retour"]);
  assert.deepEqual(conditionItems.filter(item => item.id === "pitch-and-putt" || item.id === "kaleke").map(item => item.label),
    ["Kaleka course aller", "Kaleka course retour"]);
});

test("manual closures remain until changed, including on following Paris days", () => {
  const condition = { id: "restaurant" as const, status: "closed" as const, reason: "Travaux", updatedAt: "2026-01-01T21:30:00Z" };
  assert.deepEqual(visibleCondition(condition), condition);
  const reopened = { ...condition, status: "open" as const, reason: null, updatedAt: "2026-10-16T12:00:00Z" };
  assert.deepEqual(visibleCondition(reopened), reopened);
});

test("all unset equipment starts open and explicit unknown states remain visible", () => {
  assert.ok(emptyConditions().every(condition => condition.status === "open"));
  assert.equal(visibleCondition({ id: "practice", status: "unknown", reason: null, updatedAt: null }).status, "open");
  const unknown = { id: "practice" as const, status: "unknown" as const, reason: null, updatedAt: "2026-01-01T12:00:00Z" };
  assert.deepEqual(visibleCondition(unknown), unknown);
});

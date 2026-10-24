import assert from "node:assert/strict";
import test from "node:test";
import { parseConditionInput, parseConditionItem, parseConditionState, visibleCondition } from "./site-conditions";
import { conditionItems, emptyConditions, previewConditions } from "../data/site-conditions";

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
  const condition = { ...emptyConditions().find(item => item.id === "restaurant")!, status: "closed" as const, reason: "Travaux", updatedAt: "2026-01-01T21:30:00Z" };
  assert.deepEqual(visibleCondition(condition), condition);
  const reopened = { ...condition, status: "open" as const, reason: null, updatedAt: "2026-10-16T12:00:00Z" };
  assert.deepEqual(visibleCondition(reopened), reopened);
});

test("unset equipment remains unconfirmed while the preview keeps its demo states", () => {
  assert.ok(emptyConditions().every(condition => condition.status === "unknown"));
  assert.equal(visibleCondition(emptyConditions().find(item => item.id === "practice")!).status, "unknown");
  assert.ok(previewConditions().every(condition => condition.status === "open"));
  assert.equal(previewConditions().find(condition => condition.id === "grand-parcours-aller")?.stateLabel, "Carotté");
  const unknown = { ...emptyConditions().find(item => item.id === "practice")!, updatedAt: "2026-01-01T12:00:00Z" };
  assert.deepEqual(visibleCondition(unknown), unknown);
});

test("custom equipment and states are validated server-side", () => {
  const item = parseConditionItem({ id: "nouveau-parcours", label: " Nouveau parcours ", group: "courses", href: "/golf" });
  assert.ok(item.ok);
  assert.equal(item.item.label, "Nouveau parcours");
  assert.equal(parseConditionItem({ id: "dangereux", label: "Lien", group: "courses", href: "//example.com" }).ok, false);
  const state = parseConditionState({ id: "entretien", label: "Entretien", status: "open" });
  assert.ok(state.ok);
  const parsed = parseConditionInput({ id: "nouveau-parcours", status: "open", stateId: "entretien", reason: "" },
    ["nouveau-parcours"], [state.state]);
  assert.ok(parsed.ok);
  assert.equal(parsed.condition.stateLabel, "Entretien");
  assert.equal(parseConditionInput({ id: "nouveau-parcours", status: "closed", stateId: "entretien", reason: "Travaux" },
    ["nouveau-parcours"], [state.state]).ok, false);
});

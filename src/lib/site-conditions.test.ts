import assert from "node:assert/strict";
import test from "node:test";
import { isCarotteReason, parseConditionInput, parseConditionItem, parseConditionState, parseSyncedConditionInput, visibleCondition } from "./site-conditions";
import { conditionItems, departureStates, emptyConditions, previewConditions } from "../data/site-conditions";

test("a closed condition accepts no reason but limits optional text", () => {
  const id = "grand-parcours-aller";
  const withoutReason = parseConditionInput({ id, status: "closed", reason: "" });
  assert.ok(withoutReason.ok);
  assert.equal(withoutReason.condition.reason, null);
  assert.equal(parseConditionInput({ id, status: "closed", reason: "x".repeat(241) }).ok, false);
  assert.equal(parseConditionInput({ id, status: "restricted", reason: "Restriction" }).ok, false);
  assert.equal(parseConditionInput({ id: "other", status: "open" }).ok, false);
  const parsed = parseConditionInput({ id, status: "closed", reason: "  Terrain détrempé  " });
  assert.ok(parsed.ok);
  assert.equal(parsed.condition.reason, "Terrain détrempé");
});

test("grand parcours, Kaleka course aller and Kaleka course have separate states", () => {
  assert.equal(conditionItems.length, 10);
  assert.deepEqual(conditionItems.filter(item => item.id.startsWith("grand-parcours-")).map(item => item.label),
    ["Grand parcours aller", "Grand parcours retour"]);
  assert.deepEqual(conditionItems.filter(item => item.id === "pitch-and-putt" || item.id === "kaleke").map(item => item.label),
    ["Kaleka course aller", "Kaleka course retour"]);
});

test("manual closures remain until changed, including on following Paris days", () => {
  const condition = { ...emptyConditions().find(item => item.id === "restaurant")!, status: "closed" as const, reason: "Travaux", updatedAt: "2026-01-01T21:30:00Z" };
  assert.deepEqual(visibleCondition(condition, new Date("2026-11-10T12:00:00Z")), condition);
  const reopened = { ...condition, status: "open" as const, reason: null, updatedAt: "2026-10-16T12:00:00Z" };
  assert.deepEqual(visibleCondition(reopened, new Date("2026-11-11T12:00:00Z")), reopened);
});

test("restaurant closes every Tuesday in Paris without changing its saved state", () => {
  const condition = { ...emptyConditions().find(item => item.id === "restaurant")!, status: "open" as const, stateLabel: "Service normal" };
  for (const [before, tuesday, after] of [
    ["2026-11-09T22:59:59Z", "2026-11-09T23:00:00Z", "2026-11-10T23:00:00Z"],
    ["2027-07-05T21:59:59Z", "2027-07-05T22:00:00Z", "2027-07-06T22:00:00Z"],
  ]) {
    assert.deepEqual(visibleCondition(condition, new Date(before)), condition);
    const closed = visibleCondition(condition, new Date(tuesday));
    assert.equal(closed.status, "closed");
    assert.equal(closed.stateLabel, null);
    assert.equal(closed.reason, "Fermeture hebdomadaire du mardi.");
    assert.deepEqual(visibleCondition(condition, new Date(after)), condition);
  }
  assert.equal(condition.status, "open");
});

test("Tuesday closure covers unknown restaurant status while preserving manual closures and other equipment", () => {
  const tuesday = new Date("2026-11-10T12:00:00Z");
  const restaurant = emptyConditions().find(item => item.id === "restaurant")!;
  assert.equal(visibleCondition(restaurant, tuesday).status, "closed");
  const manual = { ...restaurant, status: "closed" as const, reason: "Travaux", stateLabel: "Fermeture exceptionnelle" };
  assert.deepEqual(visibleCondition(manual, tuesday), manual);
  assert.deepEqual(visibleCondition(manual, new Date("2026-11-11T12:00:00Z")), manual);
  const practice = { ...emptyConditions().find(item => item.id === "practice")!, status: "open" as const };
  assert.deepEqual(visibleCondition(practice, tuesday), practice);
});

test("unset equipment remains unconfirmed while the preview keeps its demo states", () => {
  assert.ok(emptyConditions().every(condition => condition.status === "unknown"));
  assert.equal(visibleCondition(emptyConditions().find(item => item.id === "practice")!).status, "unknown");
  assert.ok(previewConditions().filter(condition => condition.id !== "departs").every(condition => condition.status === "open"));
  assert.equal(previewConditions().find(condition => condition.id === "departs")?.status, "unknown");
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

test("Carotté is a selectable state and legacy spelling displays as that state", () => {
  assert.equal(isCarotteReason("carrote"), true);
  const selected = parseConditionInput({ id: "grand-parcours-aller", status: "open", reason: "Carotté" });
  assert.ok(selected.ok);
  assert.equal(selected.condition.stateLabel, "Carotté");
  assert.equal(selected.condition.reason, null);
  const legacy = parseConditionInput({ id: "grand-parcours-aller", status: "open", reason: "carrote" });
  assert.ok(legacy.ok);
  assert.equal(legacy.condition.stateLabel, "Carotté");
  assert.equal(legacy.condition.reason, null);
});

test("scoped synchronization accepts only a matching known state label", () => {
  const states = [{ id: "carotte", label: "Carotté", status: "open" as const }];
  const id = "grand-parcours-aller";
  const valid = parseSyncedConditionInput({ id, status: "open", stateLabel: "Carotté", reason: null }, [id], states);
  assert.ok(valid.ok);
  assert.equal(valid.condition.stateLabel, "Carotté");
  assert.equal(parseSyncedConditionInput({ id, status: "open", stateLabel: "Privé", reason: null }, [id], states).ok, false);
  assert.equal(parseSyncedConditionInput({ id, status: "closed", stateLabel: "Carotté", reason: "Travaux" }, [id], states).ok, false);
});

test("winter and summer departure choices apply only to the departure row", () => {
  const ids = conditionItems.map(item => item.id);
  const winter = parseConditionInput({ id: "departs", status: "open", stateId: "depart-hiver", reason: "" }, ids, departureStates);
  assert.ok(winter.ok);
  assert.equal(winter.condition.stateLabel, "Départ d’hiver");
  assert.equal(parseConditionInput({ id: "departs", status: "open", reason: "" }, ids, departureStates).ok, false);
  assert.equal(parseConditionInput({ id: "practice", status: "open", stateId: "depart-ete" }, ids, departureStates).ok, false);
  const synced = parseSyncedConditionInput({ id: "departs", status: "open", stateLabel: "Départ d’été", reason: null }, ids, departureStates);
  assert.ok(synced.ok);
  assert.equal(synced.condition.stateLabel, "Départ d’été");
  assert.equal(parseSyncedConditionInput({ id: "practice", status: "open", stateLabel: "Départ d’été", reason: null }, ids, departureStates).ok, false);
});

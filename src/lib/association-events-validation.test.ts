import assert from "node:assert/strict";
import test from "node:test";
import { parseEventInput, validEventId } from "./association-events-validation";

test("competition input accepts multi-day events and clears optional fields", () => {
  const result = parseEventInput({ title: "  Coupe du club  ", start: "2026-12-31", end: "2027-01-02", time: "09:30", note: "Scramble", status: "private" });
  assert.ok(result.ok);
  assert.equal(result.event.title, "Coupe du club");
  assert.equal(result.event.end, "2027-01-02");
  const cleared = parseEventInput({ title: "Coupe", start: "2028-02-29", end: "", time: "", note: " ", status: "" });
  assert.ok(cleared.ok);
  assert.equal(cleared.event.status, undefined);
  assert.equal(cleared.event.end, undefined);
});

test("competition input rejects invalid dates, reversed ranges and invalid fields", () => {
  const base = { title: "Coupe", start: "2026-09-16" };
  for (const input of [null, [], { ...base, title: " " }, { ...base, title: "x".repeat(161) },
    { ...base, start: "2026-02-29" }, { ...base, start: "2026-04-31" }, { ...base, start: "2026-9-16" },
    { ...base, end: "2026-09-15" }, { ...base, time: "24:00" }, { ...base, status: "published" },
    { ...base, note: "x".repeat(2001) }, { ...base, time: 930 }, { ...base, note: { text: "test" } },
  ]) assert.equal(parseEventInput(input).ok, false, JSON.stringify(input));
});

test("competition IDs support legacy and new records but reject query fragments", () => {
  assert.equal(validEventId("2026-09-16-12"), true);
  assert.equal(validEventId("99cb3695-8c85-4b94-99c5-5f46546fc516"), true);
  for (const id of [null, "", "../test", "eq.test", "x".repeat(81)]) assert.equal(validEventId(id), false);
});

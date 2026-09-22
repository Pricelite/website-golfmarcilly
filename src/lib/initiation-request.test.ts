import test from "node:test";
import assert from "node:assert/strict";
import { parseInitiationRequest, buildInitiationRequestEmail } from "./initiation/request";

const now = new Date("2026-09-21T10:00:00Z");
const valid = { date: "2026-10-24", startTime: "15:00", fullName: "Jean Test", email: "jean@example.test", phone: "0600000000", participantsCount: 3, mealOption: "WITH_MEAL", note: "Débutants" };

test("initiation requests accept desired dates beyond seven days and calculate prices server-side", () => {
  const parsed = parseInitiationRequest({ ...valid, totalPriceCents: 1 }, now);
  assert.ok(parsed.ok);
  assert.equal(parsed.data.totalPriceCents, 14400);
  const mail = buildInitiationRequestEmail(parsed.data);
  assert.equal(mail.replyTo, valid.email);
  assert.ok(mail.text.includes("15:00"));
  assert.ok(mail.text.includes("Participants : 3"));
  assert.ok(mail.text.includes("aucune place n’est réservée automatiquement"));
});

test("initiation requests reject invalid or past dates, past Paris times, invalid contacts and quantities", () => {
  for (const patch of [{ date: "2026-02-30" }, { date: "2026-09-20" }, { date: "2026-09-21", startTime: "11:00" }, { startTime: "25:00" }, { fullName: "X\r\nBcc: test" }, { email: "invalid" }, { participantsCount: 0 }, { participantsCount: 1.5 }, { participantsCount: 13 }, { participantsCount: "2" }, { mealOption: "FREE" }, { note: "x".repeat(2001) }]) {
    assert.equal(parseInitiationRequest({ ...valid, ...patch }, now).ok, false);
  }
  assert.equal(parseInitiationRequest(null, now).ok, false);
});

import test from "node:test";
import assert from "node:assert/strict";
import { parseInitiationRequest, buildInitiationRequestEmail, initiationRequestFingerprint } from "./initiation/request";

const now = new Date("2026-09-21T10:00:00Z");
const valid = { date: "2026-10-24", startTime: "15:00", firstName: "Jean", lastName: "Test", email: "jean@example.test", phone: "0600000000", participantsCount: 3, mealOption: "WITH_MEAL", note: "Débutants" };

test("initiation requests accept desired dates beyond seven days and calculate prices server-side", () => {
  const parsed = parseInitiationRequest({ ...valid, totalPriceCents: 1 }, now);
  assert.ok(parsed.ok);
  assert.equal(parsed.data.totalPriceCents, 14400);
  assert.equal(parsed.data.fullName, "Jean Test");
  const mail = buildInitiationRequestEmail(parsed.data);
  assert.equal(mail.replyTo, valid.email);
  assert.equal(mail.replyToName, "Jean Test");
  assert.ok(mail.text.includes("15:00"));
  assert.ok(mail.text.includes("Participants : 3"));
  assert.ok(mail.text.includes("aucune place n’est réservée automatiquement"));
});

test("repeat initiation requests use the same deduplication key", () => {
  const first = parseInitiationRequest(valid, now);
  const repeated = parseInitiationRequest({ ...valid, note: "Autre précision" }, now);
  const different = parseInitiationRequest({ ...valid, startTime: "16:00" }, now);
  assert.ok(first.ok && repeated.ok && different.ok);
  assert.equal(initiationRequestFingerprint(first.data), initiationRequestFingerprint(repeated.data));
  assert.notEqual(initiationRequestFingerprint(first.data), initiationRequestFingerprint(different.data));
});

test("older initiation forms can still send a full name", () => {
  const legacy = { date: valid.date, startTime: valid.startTime, email: valid.email, phone: valid.phone,
    participantsCount: valid.participantsCount, mealOption: valid.mealOption, note: valid.note };
  const parsed = parseInitiationRequest({ ...legacy, fullName: "Jean Test" }, now);
  assert.ok(parsed.ok);
  assert.equal(parsed.data.fullName, "Jean Test");
  assert.equal(parseInitiationRequest({ ...legacy, fullName: "Jean\r\nBcc: test" }, now).ok, false);
  assert.equal(parseInitiationRequest({ ...legacy, firstName: "Jean", fullName: "Jean Test" }, now).ok, false);
});

test("initiation requests reject invalid or past dates, past Paris times, invalid contacts and quantities", () => {
  for (const patch of [{ date: "2026-02-30" }, { date: "2026-09-20" }, { date: "2026-09-21", startTime: "11:00" }, { startTime: "25:00" }, { firstName: "" }, { lastName: "   " }, { firstName: "X\r\nBcc: test" }, { lastName: "X\r\nBcc: test" }, { firstName: "x".repeat(61) }, { lastName: "x".repeat(61) }, { email: "invalid" }, { participantsCount: 0 }, { participantsCount: 1.5 }, { participantsCount: 13 }, { participantsCount: "2" }, { mealOption: "FREE" }, { note: "x".repeat(2001) }]) {
    assert.equal(parseInitiationRequest({ ...valid, ...patch }, now).ok, false);
  }
  assert.equal(parseInitiationRequest(null, now).ok, false);
});

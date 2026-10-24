import assert from "node:assert/strict";
import test from "node:test";
import { parseQuoteDate } from "./quote-date";
import { spawnSync } from "node:child_process";

test("quote date stays optional and rejects invalid or past dates using the Paris day", () => {
  const now = new Date("2026-10-16T22:30:00Z");
  for (const value of [undefined, ""]) assert.deepEqual(parseQuoteDate(value, now), { ok: true, date: "" });
  for (const value of [null, 20261017, "2026-10-16", "2026-02-30", "2026-10-17\n", "x".repeat(100)]) assert.equal(parseQuoteDate(value, now).ok, false);
  assert.deepEqual(parseQuoteDate("2026-10-17", now), { ok: true, date: "2026-10-17" });
});

test("desired date reaches both email representations and legacy requests still work", () => {
  const payload = { company: "Club", email: "test@example.com", eventType: "Séminaire", details: "Projet", desiredDate: "2026-10-17" };
  const result = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "--input-type=module", "-e", `import { buildQuoteEmail } from './src/lib/form-emails.ts'; console.log(JSON.stringify([buildQuoteEmail(${JSON.stringify(payload)}), buildQuoteEmail({ ...${JSON.stringify(payload)}, desiredDate: undefined })]));`], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const [email, legacy] = JSON.parse(result.stdout);
  assert.match(email.text, /Date souhaitée : 17 octobre 2026/);
  assert.match(email.html, /17 octobre 2026/);
  assert.match(legacy.text, /À définir/);
});

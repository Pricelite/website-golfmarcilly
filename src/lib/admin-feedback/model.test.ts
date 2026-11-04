import assert from "node:assert/strict";
import test from "node:test";
import { feedbackMail, parseFeedback } from "./model";

test("feedback validates type, optional email, message limits, page and spam fields", () => {
  const now = 1_800_000_000_000;
  const valid = { type: "Bug", message: "Un bouton ne fonctionne pas.", email: "", page: "/golf", website: "", openedAt: now - 3000 };
  const parsed = parseFeedback(valid, now)!;
  assert.ok(parsed);
  for (const patch of [{ type: "admin" }, { message: "  " }, { message: "a".repeat(4001) }, { email: "bad" },
    { email: "a@example.org\r\nBcc: autre@example.org" }, { page: "//evil.example" }, { page: "/golf?secret=x" },
    { page: "/golf#section" }, { page: "/a/../admin" }, { website: "spam" }, { openedAt: now }, { openedAt: now + 5000 }]) {
    assert.equal(parseFeedback({ ...valid, ...patch }, now), null, JSON.stringify(patch));
  }
  const mail = feedbackMail({ ...parsed, email: "visitor@example.org" }, "https://www.golfdemarcilly.com", new Date(now));
  assert.equal(mail.replyTo, "visitor@example.org");
  for (const text of ["Bug", parsed.message, "visitor@example.org", "https://www.golfdemarcilly.com/golf", new Date(now).toISOString()]) assert.ok(mail.text.includes(text));
  assert.equal(feedbackMail(parsed, "https://www.golfdemarcilly.com", new Date(now)).replyTo, undefined);
});

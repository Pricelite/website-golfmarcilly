import assert from "node:assert/strict";
import test from "node:test";

import { selectChatKnowledge } from "@/data/chat-knowledge";
import { buildDemoReply, extractOpenAIText, parseChatTurns, parseModelReply } from "@/lib/chat/core";

test("chat rejects empty, oversized and non-user final messages", () => {
  assert.equal(parseChatTurns([]), null);
  assert.equal(parseChatTurns([{ role: "user", content: "x".repeat(801) }]), null);
  assert.equal(parseChatTurns([{ role: "assistant", content: "Bonjour" }]), null);
  assert.deepEqual(parseChatTurns([{ role: "user", content: "  Bonjour  " }]), [{ role: "user", content: "Bonjour" }]);
});

test("knowledge and demo answer stay on real pages", () => {
  assert.equal(selectChatKnowledge("Peut-on déjeuner à La Bergerie sans jouer ?")[0]?.path, "/restaurant");
  assert.equal(selectChatKnowledge("Peut-on déjeuner sans jouer au golf ?")[0]?.path, "/restaurant");
  const reply = buildDemoReply("Quels parcours de golf proposez-vous ?");
  assert.equal(reply.mode, "demo");
  assert.equal(reply.links[0]?.href, "/golf");
  assert.equal(buildDemoReply("Question introuvable xyzxyz").links[0]?.href, "/contact");
});

test("model output cannot create arbitrary navigation links or unsourced prices", () => {
  const entries = selectChatKnowledge("Parcours de golf");
  const reply = parseModelReply(JSON.stringify({ answer: "Découvrez nos parcours.", links: ["https://evil.example", "/golf", "/golf"] }), entries);
  assert.deepEqual(reply?.links.map((link) => link.href), ["/golf"]);
  assert.equal(parseModelReply(JSON.stringify({ answer: "Ce parcours coûte 999 €.", links: [] }), entries), null);
  assert.equal(parseModelReply(JSON.stringify({ answer: "Ce parcours coûte 999 euros.", links: [] }), entries), null);
  assert.equal(parseModelReply(JSON.stringify({ answer: "Visitez https://evil.example", links: [] }), entries), null);
  assert.equal(parseModelReply(JSON.stringify({ answer: "La demi-journée découverte est à 25 €.", links: ["/tarifs"] }), selectChatKnowledge("tarif découverte"))?.links[0]?.href, "/tarifs");
});

test("incomplete model responses are not displayed", () => {
  assert.equal(extractOpenAIText({ status: "incomplete", output: [] }), null);
  assert.equal(extractOpenAIText({ status: "completed", output: [{ content: [{ type: "output_text", text: "ok" }] }] }), "ok");
});

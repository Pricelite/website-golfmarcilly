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

test("model output cannot create arbitrary links or unverifiable commercial facts", () => {
  const reply = parseModelReply(JSON.stringify({ answer: "Découvrez nos parcours.", links: ["https://evil.example", "/golf", "/golf"] }));
  assert.deepEqual(reply?.links.map((link) => link.href), ["/golf"]);
  assert.equal(parseModelReply(JSON.stringify({ answer: "Ce parcours coûte 999 €.", links: [] })), null);
  assert.equal(parseModelReply(JSON.stringify({ answer: "Les cours adultes coûtent 25 €, prix figurant pour une autre offre.", links: [] })), null);
  assert.equal(parseModelReply(JSON.stringify({ answer: "Le restaurant ferme à 23 h.", links: [] })), null);
  assert.equal(parseModelReply(JSON.stringify({ answer: "Le restaurant ferme à minuit.", links: [] })), null);
  assert.equal(parseModelReply(JSON.stringify({ answer: "Il reste des places disponibles demain.", links: [] })), null);
  assert.equal(parseModelReply(JSON.stringify({ answer: "Visitez https://evil.example", links: [] })), null);
});

test("restaurant menu knowledge includes dishes from the page", () => {
  const entries = selectChatKnowledge("Quels plats propose le Menu Gourmand ?");
  assert.equal(entries[0]?.title, "Menu Gourmand");
  assert.match(entries[0]?.facts ?? "", /Dos de cabillaud/);
  assert.match(entries[0]?.facts ?? "", /Médaillon de filet mignon/);
  const reply = buildDemoReply("Quels plats propose le Menu Gourmand ?");
  assert.match(reply.answer, /Dos de cabillaud/);
  assert.equal(reply.links[0]?.href, "/restaurant");
});

test("incomplete model responses are not displayed", () => {
  assert.equal(extractOpenAIText({ status: "incomplete", output: [] }), null);
  assert.equal(extractOpenAIText({ status: "completed", output: [{ content: [{ type: "output_text", text: "ok" }] }] }), "ok");
});

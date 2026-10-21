import assert from "node:assert/strict";
import test from "node:test";
import { deliverDurably, DeliveryClaimError } from "./durable-delivery";

function harness(options: { mailFails?: boolean; storeFails?: boolean; releaseFails?: boolean; allowed?: boolean; unavailable?: boolean } = {}) {
  const calls: string[] = [];
  const sendError = new Error("mail unavailable");
  const operations = {
    claim: async () => { calls.push("claim"); return { allowed: options.allowed ?? true, unavailable: options.unavailable, retryAfterSeconds: 60 }; },
    send: async () => { calls.push("send"); if (options.mailFails) throw sendError; },
    store: async () => { calls.push("store"); if (options.storeFails) throw new Error("database unavailable"); },
    release: async () => { calls.push("release"); if (options.releaseFails) throw new Error("release unavailable"); },
  };
  return { calls, sendError, operations };
}

test("successful delivery retains its claim without storing or releasing", async () => {
  const h = harness();
  assert.deepEqual(await deliverDurably(h.operations), { queued: false });
  assert.deepEqual(h.calls, ["claim", "send"]);
});

test("mail failure is accepted only after durable storage and retains the claim", async () => {
  const h = harness({ mailFails: true });
  assert.deepEqual(await deliverDurably(h.operations), { queued: true });
  assert.deepEqual(h.calls, ["claim", "send", "store"]);
});

test("failure of both paths releases the claim and rejects instead of reporting success", async () => {
  const h = harness({ mailFails: true, storeFails: true });
  await assert.rejects(deliverDurably(h.operations), error => error === h.sendError);
  assert.deepEqual(h.calls, ["claim", "send", "store", "release"]);
});

test("a release failure cannot become success or mask the original delivery error", async () => {
  const h = harness({ mailFails: true, storeFails: true, releaseFails: true });
  await assert.rejects(deliverDurably(h.operations), error => error === h.sendError);
});

test("duplicate or unavailable claim never sends or stores another request", async () => {
  for (const unavailable of [false, true]) {
    const h = harness({ allowed: false, unavailable });
    await assert.rejects(deliverDurably(h.operations), error => error instanceof DeliveryClaimError && error.unavailable === unavailable && error.retryAfterSeconds === 60);
    assert.deepEqual(h.calls, ["claim"]);
  }
});

test("concurrent attempts sharing one claim produce only one queued entry", async () => {
  let claimed = false;
  let entries = 0;
  const operations = {
    claim: async () => { const allowed = !claimed; claimed = true; return { allowed, retryAfterSeconds: 600 }; },
    send: async () => { throw new Error("mail unavailable"); },
    store: async () => { entries++; },
    release: async () => { claimed = false; },
  };
  const results = await Promise.allSettled([deliverDurably(operations), deliverDurably(operations)]);
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
  assert.equal(entries, 1);
});

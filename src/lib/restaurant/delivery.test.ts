import assert from "node:assert/strict";
import test from "node:test";
import { deliverRestaurantRequest, restaurantRequestFingerprint } from "./delivery";

test("restaurant duplicate fingerprint ignores the email submission timestamp", () => {
  const request = { day: "2026-10-24", time: "12:00", name: "Camille", email: "camille@example.com", partySize: 2 };
  assert.equal(restaurantRequestFingerprint(request), restaurantRequestFingerprint({ ...request }));
  assert.notEqual(restaurantRequestFingerprint(request), restaurantRequestFingerprint({ ...request, time: "12:30" }));
});

test("restaurant request failure never sends an acknowledgement or reports success", async () => {
  let acknowledgements = 0;
  await assert.rejects(deliverRestaurantRequest(
    async () => { throw new Error("service unavailable"); },
    async () => { acknowledgements++; },
  ));
  assert.equal(acknowledgements, 0);
});

test("acknowledgement failure preserves delivery and does not resend the request", async () => {
  let requests = 0;
  const result = await deliverRestaurantRequest(
    async () => { requests++; return { queued: false }; },
    async () => { throw new Error("service unavailable"); },
  );
  assert.deepEqual(result, { queued: false, acknowledgementSent: false });
  assert.equal(requests, 1);
});

test("successful delivery sends request before acknowledgement", async () => {
  const steps: string[] = [];
  assert.deepEqual(await deliverRestaurantRequest(
    async () => { steps.push("request"); return { queued: false }; },
    async () => { steps.push("acknowledgement"); },
  ), { queued: false, acknowledgementSent: true });
  assert.deepEqual(steps, ["request", "acknowledgement"]);
});

test("queued restaurant requests do not send a misleading email acknowledgement", async () => {
  let acknowledgements = 0;
  assert.deepEqual(await deliverRestaurantRequest(
    async () => ({ queued: true }),
    async () => { acknowledgements++; },
  ), { queued: true, acknowledgementSent: false });
  assert.equal(acknowledgements, 0);
});

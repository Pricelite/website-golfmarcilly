import assert from "node:assert/strict";
import test from "node:test";
import { deliverRestaurantRequest } from "./delivery";

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
    async () => { requests++; },
    async () => { throw new Error("service unavailable"); },
  );
  assert.deepEqual(result, { acknowledgementSent: false });
  assert.equal(requests, 1);
});

test("successful delivery sends request before acknowledgement", async () => {
  const steps: string[] = [];
  assert.deepEqual(await deliverRestaurantRequest(
    async () => { steps.push("request"); },
    async () => { steps.push("acknowledgement"); },
  ), { acknowledgementSent: true });
  assert.deepEqual(steps, ["request", "acknowledgement"]);
});

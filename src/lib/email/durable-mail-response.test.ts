import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("delivery claims keep their HTTP status, retry header and safe public errors", () => {
  const result = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "--input-type=module", "-e", `
    import assert from 'node:assert/strict';
    import { DeliveryClaimError } from './src/lib/email/durable-delivery.ts';
    import { buildMailApiErrorResponse, mailFailureStatus, mailFailureHeaders } from './src/lib/email/api-response.ts';
    const duplicate = new DeliveryClaimError(false, 600);
    assert.equal(mailFailureStatus(duplicate), 409);
    assert.equal(buildMailApiErrorResponse(duplicate).code, 'duplicate');
    assert.deepEqual(mailFailureHeaders(duplicate), { 'Retry-After': '600' });
    const unavailable = new DeliveryClaimError(true, 60);
    assert.equal(mailFailureStatus(unavailable), 503);
    assert.equal(buildMailApiErrorResponse(unavailable).code, 'unavailable');
    const error = new Error('private provider details');
    assert.equal(mailFailureStatus(error), 503);
    assert.deepEqual(mailFailureHeaders(error), {});
    assert.ok(!JSON.stringify(buildMailApiErrorResponse(error)).includes('private provider details'));
  `], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

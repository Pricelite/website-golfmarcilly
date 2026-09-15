import assert from "node:assert/strict";
import test from "node:test";
import { getFormErrorMessage } from "./form-feedback";

test("public form errors provide French recovery instructions without configuration details", () => {
  assert.match(getFormErrorMessage(400), /Vérifiez/);
  assert.match(getFormErrorMessage(403), /Rechargez/);
  assert.match(getFormErrorMessage(429), /Patientez/);
  for (const status of [200, 500, 502, 503]) {
    assert.match(getFormErrorMessage(status), /02 38 76 11 73/);
    assert.doesNotMatch(getFormErrorMessage(status), /SMTP|Brevo|\.env|EMAIL_|Internal/);
  }
});

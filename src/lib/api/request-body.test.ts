import assert from "node:assert/strict";
import test from "node:test";
import { readJsonBody } from "./request-body";

test("public forms reject null, arrays, primitives and malformed JSON before reading fields", async () => {
  for (const body of ["null", "[]", "42", "true", '"text"', "{"]) {
    const result = await readJsonBody(new Request("http://localhost/api/contact", { method: "POST", body }));
    assert.deepEqual(result, { ok: false }, body);
  }
  const result = await readJsonBody(new Request("http://localhost/api/contact", {
    method: "POST", body: JSON.stringify({ firstName: "Anne" }),
  }));
  assert.deepEqual(result, { ok: true, data: { firstName: "Anne" } });
});

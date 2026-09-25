import assert from "node:assert/strict";
import test from "node:test";
import { MAX_PUBLIC_JSON_BYTES, readJsonBody } from "./request-body";

test("public forms reject null, arrays, primitives and malformed JSON before reading fields", async () => {
  for (const body of ["null", "[]", "42", "true", '"text"', "{"]) {
    const result = await readJsonBody(new Request("http://localhost/api/contact", { method: "POST", body }));
    assert.deepEqual(result, { ok: false, tooLarge: false }, body);
  }
  const result = await readJsonBody(new Request("http://localhost/api/contact", {
    method: "POST", body: JSON.stringify({ firstName: "Anne" }),
  }));
  assert.deepEqual(result, { ok: true, data: { firstName: "Anne" } });
});

test("public forms reject oversized JSON before parsing, even without Content-Length", async () => {
  const oversized = JSON.stringify({ message: "é".repeat(MAX_PUBLIC_JSON_BYTES) });
  const request = new Request("http://localhost/api/contact", { method: "POST", body: oversized });
  assert.deepEqual(await readJsonBody(request), { ok: false, tooLarge: true });

  const declared = new Request("http://localhost/api/contact", {
    method: "POST", body: "{}", headers: { "content-length": String(MAX_PUBLIC_JSON_BYTES + 1) },
  });
  assert.deepEqual(await readJsonBody(declared), { ok: false, tooLarge: true });
});

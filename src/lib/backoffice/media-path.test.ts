import assert from "node:assert/strict";
import test from "node:test";
import { resolve } from "node:path";
import { resolveMediaPath } from "./media-path";

test("media paths reject traversal, encoded separators and malformed identifiers", () => {
  const root = resolve(".data", "media");
  const id = "12345678-abcd-4321-abcd-123456789abc";
  assert.equal(resolveMediaPath(root, id), resolve(root, id));
  for (const invalid of ["", "..", "../outside.txt", "..\\outside.txt", "/tmp/file", "C:\\file", "%2e%2e%2foutside", "-".repeat(36), `${id}/..`, `${id}\0`]) {
    assert.equal(resolveMediaPath(root, invalid), null, invalid);
  }
});

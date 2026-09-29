import assert from "node:assert/strict";
import test from "node:test";

import { sanitizeAssetPath } from "@/lib/protected-image-path";

test("protected image path rejects encoded traversal and accepts normal images", () => {
  assert.equal(sanitizeAssetPath(["images", "photo.png"]), "images/photo.png");
  assert.equal(sanitizeAssetPath(["images%2F..%2F..%2Fsecret.png"]), null);
  assert.equal(sanitizeAssetPath(["..", "secret.png"]), null);
  assert.equal(sanitizeAssetPath(["images", "photo.svg"]), null);
});

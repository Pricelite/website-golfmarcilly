import assert from "node:assert/strict";
import test from "node:test";
import { localContentStoreEnabled, sharedContentSyncEnabled, validateSharedContentConfig } from "./content-config";

test("shared content stays local by default and is restricted to development", () => {
  const original = { ...process.env };
  try {
    Reflect.set(process.env, "NODE_ENV", "development");
    delete process.env.CONTENT_SYNC_ENABLED;
    assert.equal(localContentStoreEnabled(), true);
    assert.equal(sharedContentSyncEnabled(), false);
    process.env.CONTENT_SYNC_ENABLED = "true";
    assert.equal(localContentStoreEnabled(), false);
    assert.equal(sharedContentSyncEnabled(), true);
    Reflect.set(process.env, "NODE_ENV", "production");
    assert.equal(localContentStoreEnabled(), false);
    assert.equal(sharedContentSyncEnabled(), false);
  } finally {
    Reflect.set(process.env, "NODE_ENV", original.NODE_ENV);
    if (original.CONTENT_SYNC_ENABLED === undefined) delete process.env.CONTENT_SYNC_ENABLED;
    else process.env.CONTENT_SYNC_ENABLED = original.CONTENT_SYNC_ENABLED;
  }
});

test("shared mode rejects missing or unsafe credentials instead of falling back", () => {
  assert.throws(() => validateSharedContentConfig(undefined, undefined), /incomplete/);
  assert.throws(() => validateSharedContentConfig("http://example.test", "dummy"), /HTTPS/);
  assert.deepEqual(validateSharedContentConfig(" https://example.supabase.co ", " secret "), {
    url: "https://example.supabase.co", serviceRoleKey: "secret",
  });
});

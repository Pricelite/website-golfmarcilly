import assert from "node:assert/strict";
import test from "node:test";
import { createContentAdminClient, localContentStoreEnabled, sharedContentSyncEnabled } from "./content";

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
  const original = {
    nodeEnv: process.env.NODE_ENV,
    enabled: process.env.CONTENT_SYNC_ENABLED,
    url: process.env.CONTENT_SUPABASE_URL,
    key: process.env.CONTENT_SUPABASE_SERVICE_ROLE_KEY,
  };
  try {
    Reflect.set(process.env, "NODE_ENV", "development");
    process.env.CONTENT_SYNC_ENABLED = "true";
    delete process.env.CONTENT_SUPABASE_URL;
    delete process.env.CONTENT_SUPABASE_SERVICE_ROLE_KEY;
    assert.throws(createContentAdminClient, /incomplete/);
    process.env.CONTENT_SUPABASE_URL = "http://example.test";
    process.env.CONTENT_SUPABASE_SERVICE_ROLE_KEY = "dummy";
    assert.throws(createContentAdminClient, /HTTPS/);
  } finally {
    Reflect.set(process.env, "NODE_ENV", original.nodeEnv);
    for (const [name, value] of [
      ["CONTENT_SYNC_ENABLED", original.enabled],
      ["CONTENT_SUPABASE_URL", original.url],
      ["CONTENT_SUPABASE_SERVICE_ROLE_KEY", original.key],
    ] as const) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

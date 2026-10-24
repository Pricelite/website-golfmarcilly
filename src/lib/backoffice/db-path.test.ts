import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

function checkPath(path: string | undefined, preview = false) {
  const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "production", PREVIEW_MODE: String(preview) };
  if (path === undefined) delete env.BACKOFFICE_DB_PATH;
  else env.BACKOFFICE_DB_PATH = path;
  return spawnSync(process.execPath, [
    "--conditions=react-server", "--import", "tsx", "--input-type=module", "-e",
    "import { dbPath } from './src/lib/backoffice/db.ts'; console.log(dbPath())",
  ], { cwd: process.cwd(), env, encoding: "utf8" });
}

test("production back-office requires an absolute configured database path", () => {
  assert.notEqual(checkPath(undefined).status, 0);
  assert.notEqual(checkPath(".data/backoffice.sqlite").status, 0);
  const path = resolve(process.cwd(), ".data", "backoffice.sqlite");
  const result = checkPath(path);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), path);
});

test("production back-office refuses public and temporary storage", () => {
  assert.notEqual(checkPath(resolve(process.cwd(), "public", "backoffice.sqlite")).status, 0);
  const temporaryPath = join(tmpdir(), "backoffice.sqlite");
  assert.notEqual(checkPath(temporaryPath).status, 0);
  assert.equal(checkPath(temporaryPath, true).status, 0);
});

test("admin bootstrap rejects a temporary production database before asking for a password", () => {
  const result = spawnSync(process.execPath, [
    "--import", "tsx", "scripts/backoffice-bootstrap.ts", "admin@example.com",
  ], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "production", PREVIEW_MODE: "false", BACKOFFICE_DB_PATH: join(tmpdir(), "backoffice.sqlite") },
    encoding: "utf8",
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /stockage persistant/);
});

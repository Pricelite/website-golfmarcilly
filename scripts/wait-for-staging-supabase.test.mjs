import assert from "node:assert/strict";
import test from "node:test";
import { checkResult, stagingCommit, waitForSupabase } from "./wait-for-staging-supabase.mjs";

const sha = "7a724bc39a75a9d1aa6ba74fe9b6839a6a5267a7";
const baseEnv = {
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: "develop",
  VERCEL_GIT_PROVIDER: "github",
  VERCEL_GIT_REPO_OWNER: "Pricelite",
  VERCEL_GIT_REPO_SLUG: "website-golfmarcilly",
  VERCEL_GIT_COMMIT_SHA: sha,
};
const run = (overrides = {}) => ({
  id: 12,
  name: "Supabase Preview",
  app: { slug: "supabase" },
  head_sha: sha,
  status: "completed",
  conclusion: "success",
  ...overrides,
});
const response = (checkRuns, status = 200) => new Response(JSON.stringify({ check_runs: checkRuns }), { status });

test("le verrou vise uniquement le Preview de develop et exige un SHA valide", () => {
  assert.equal(stagingCommit(baseEnv), sha);
  assert.equal(stagingCommit({ ...baseEnv, VERCEL_ENV: "production" }), null);
  assert.equal(stagingCommit({ ...baseEnv, VERCEL_GIT_COMMIT_REF: "feature" }), null);
  assert.throws(() => stagingCommit({ ...baseEnv, VERCEL_GIT_COMMIT_SHA: "" }), /SHA/);
  assert.throws(() => stagingCommit({ ...baseEnv, VERCEL_GIT_REPO_OWNER: "other" }), /dépôt/);
  assert.throws(() => stagingCommit({ ...baseEnv, VERCEL_ENV: "" }), /VERCEL_ENV/);
});

test("un check homonyme d'une autre application ou d'un autre commit ne valide pas staging", () => {
  assert.equal(checkResult([run({ app: { slug: "other" } })], sha), "pending");
  assert.equal(checkResult([run({ head_sha: "a".repeat(40) })], sha), "pending");
  assert.equal(checkResult([run({ status: "in_progress", conclusion: null })], sha), "pending");
  assert.equal(checkResult([run({ conclusion: "failure" })], sha), "failure");
});

test("le build attend le check du même commit puis passe lorsqu'il réussit", async () => {
  let clock = 0;
  let calls = 0;
  await waitForSupabase(sha, {
    fetchImpl: async () => response(++calls === 1 ? [] : [run()]),
    now: () => clock,
    delay: async (ms) => { clock += ms; },
    maxWaitMs: 100,
    pollMs: 20,
  });
  assert.equal(calls, 2);
});

test("un échec ou une absence de check bloque le build", async () => {
  await assert.rejects(waitForSupabase(sha, {
    fetchImpl: async () => response([run({ conclusion: "failure" })]),
  }), /a échoué/);

  let clock = 0;
  await assert.rejects(waitForSupabase(sha, {
    fetchImpl: async () => response([]),
    now: () => clock,
    delay: async (ms) => { clock += ms; },
    maxWaitMs: 40,
    pollMs: 20,
  }), /Délai dépassé/);

  await assert.rejects(waitForSupabase(sha, {
    fetchImpl: async () => response([], 403),
  }), /GitHub limite/);
});

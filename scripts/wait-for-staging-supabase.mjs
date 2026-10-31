import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";

const repository = "Pricelite/website-golfmarcilly";
const checkName = "Supabase Preview";
const timeoutMs = 10 * 60 * 1000;
const intervalMs = 20 * 1000;

class FatalGateError extends Error {}

export function stagingCommit(env) {
  if (!env.VERCEL_ENV) throw new Error("VERCEL_ENV absent du build Vercel.");
  if (env.VERCEL_ENV !== "preview") return null;
  if (!env.VERCEL_GIT_COMMIT_REF) throw new Error("VERCEL_GIT_COMMIT_REF absent du build Preview.");
  if (env.VERCEL_GIT_COMMIT_REF !== "develop") return null;

  if (env.VERCEL_GIT_PROVIDER !== "github"
    || `${env.VERCEL_GIT_REPO_OWNER}/${env.VERCEL_GIT_REPO_SLUG}`.toLowerCase() !== repository.toLowerCase()) {
    throw new Error("Le dépôt Git du build Staging ne correspond pas au dépôt attendu.");
  }
  const sha = env.VERCEL_GIT_COMMIT_SHA;
  if (!/^[a-f0-9]{40}$/i.test(sha ?? "")) throw new Error("VERCEL_GIT_COMMIT_SHA absent ou invalide.");
  return sha;
}

export function checkResult(checkRuns, sha) {
  if (!Array.isArray(checkRuns)) throw new Error("Réponse GitHub invalide : check_runs absent.");
  const matches = checkRuns.filter((run) => run.name === checkName
    && run.app?.slug === "supabase"
    && run.head_sha?.toLowerCase() === sha.toLowerCase());
  const latest = matches.sort((a, b) => b.id - a.id)[0];
  if (!latest || latest.status !== "completed") return "pending";
  return latest.conclusion === "success" ? "success" : "failure";
}

export async function waitForSupabase(sha, {
  fetchImpl = fetch,
  now = Date.now,
  delay = sleep,
  maxWaitMs = timeoutMs,
  pollMs = intervalMs,
} = {}) {
  const deadline = now() + maxWaitMs;
  const url = `https://api.github.com/repos/${repository}/commits/${sha}/check-runs?per_page=100`;
  while (true) {
    try {
      const response = await fetchImpl(url, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "golf-marcilly-staging-deploy-gate",
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (response.status === 403 || response.status === 429) {
        throw new FatalGateError(`GitHub limite la vérification Supabase (HTTP ${response.status}).`);
      }
      if (!response.ok) throw new Error(`GitHub a répondu HTTP ${response.status}.`);
      const result = checkResult((await response.json()).check_runs, sha);
      if (result === "success") return;
      if (result === "failure") throw new FatalGateError(`Le contrôle ${checkName} a échoué pour ${sha}.`);
    } catch (error) {
      // A failed check or rate limit must not turn into a successful deployment.
      if (error instanceof FatalGateError) throw error;
      if (now() >= deadline) throw error;
      console.warn(`Vérification Supabase indisponible, nouvelle tentative : ${error.message}`);
    }

    const remaining = deadline - now();
    if (remaining <= 0) throw new Error(`Délai dépassé pour le contrôle ${checkName} du commit ${sha}.`);
    await delay(Math.min(pollMs, remaining));
  }
}

async function main() {
  const sha = stagingCommit(process.env);
  if (!sha) {
    console.log("Contrôle Supabase Staging sans objet pour ce déploiement.");
    return;
  }
  console.log(`Attente du contrôle ${checkName} pour le commit ${sha}...`);
  await waitForSupabase(sha);
  console.log("Supabase Staging a validé ce commit ; build Vercel autorisé.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv.includes("--vercel")) {
    console.error("Ce contrôle doit être lancé par la commande de build Vercel.");
    process.exitCode = 1;
  } else {
    main().catch((error) => {
      console.error(`Build Vercel Staging bloqué : ${error.message}`);
      process.exitCode = 1;
    });
  }
}

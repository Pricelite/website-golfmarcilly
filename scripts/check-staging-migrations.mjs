import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const baseline = "20261030170000";
const source = join(root, "supabase", "migrations");
const staging = join(root, "staging", "supabase", "migrations");

function digest(path) { return createHash("sha256").update(readFileSync(path)).digest("hex"); }
function versionedFiles(path) {
  const names = readdirSync(path).filter(name => name.endsWith(".sql"));
  for (const name of names) {
    if (/^\d{8}/.test(name) && name.slice(0, 8) >= baseline.slice(0, 8)
      && !/^\d{14}_[a-z0-9_]+\.sql$/.test(name)) throw new Error(`Nom de migration invalide : ${name}`);
    if (path === source && name.slice(0, 14) === baseline) throw new Error(`Version réservée à la référence Staging : ${name}`);
  }
  const files = names.filter(name => /^\d{14}_[a-z0-9_]+\.sql$/.test(name) && name.slice(0, 14) > baseline).sort();
  const versions = files.map(name => name.slice(0, 14));
  if (new Set(versions).size !== versions.length) throw new Error(`Versions de migration en double dans ${path}`);
  return files;
}

const original = versionedFiles(source);
const copied = versionedFiles(staging);
if (original.join("\n") !== copied.join("\n")) throw new Error("Les nouvelles migrations de supabase/migrations et staging/supabase/migrations ne correspondent pas.");
for (const name of original) {
  if (digest(join(source, name)) !== digest(join(staging, name))) throw new Error(`La copie Staging de ${name} diffère de l'original.`);
}
console.log(`${original.length} nouvelle(s) migration(s) identique(s) entre source et Staging.`);

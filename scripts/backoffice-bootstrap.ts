import { randomBytes, scryptSync, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import readline from "node:readline";
import { DatabaseSync } from "node:sqlite";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage : pnpm.cmd exec tsx scripts/backoffice-bootstrap.ts adresse@email.fr");
  process.exit(1);
}

async function passwordPrompt(): Promise<string> {
  if (!process.stdin.isTTY) throw new Error("Un terminal interactif est nécessaire pour saisir le mot de passe.");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const mutable = rl as typeof rl & { _writeToOutput?: (value: string) => void };
  mutable._writeToOutput = () => {};
  process.stdout.write("Mot de passe initial (14 caractères minimum) : ");
  const password = await new Promise<string>(resolveAnswer => rl.question("", resolveAnswer));
  rl.close();
  process.stdin.pause();
  process.stdout.write("\n");
  return password;
}

async function main() {
  const password = await passwordPrompt();
  if (password.length < 14 || password.length > 256) throw new Error("Le mot de passe doit contenir entre 14 et 256 caractères.");
  const configured = process.env.BACKOFFICE_DB_PATH?.trim();
  const dbPath = configured ? (isAbsolute(configured) ? configured : resolve(configured)) : join(process.cwd(), ".data", "backoffice.sqlite");
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  try {
    db.exec("PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;");
    db.exec(readFileSync(join(process.cwd(), "src", "lib", "backoffice", "schema.sql"), "utf8"));
    const count = db.prepare("SELECT count(*) AS n FROM users WHERE role='admin' AND active=1").get() as { n: number };
    if (count.n) throw new Error("Un administrateur actif existe déjà. Utilisez le back-office pour gérer les comptes.");
    const salt = randomBytes(32);
    const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
    const now = new Date().toISOString();
    db.prepare("INSERT INTO users(id,email,name,password_hash,role,grants_json,active,created_at,updated_at) VALUES(?,?,?,?,?,'[]',1,?,?)")
      .run(randomUUID(), email, "Administrateur principal", `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`, "admin", now, now);
    console.log(`Compte administrateur créé pour ${email}. Ouvrez /admin/contenu/connexion.`);
  } finally { db.close(); }
}

void main().catch(error => { console.error(error instanceof Error ? error.message : "Initialisation impossible."); process.exitCode = 1; });

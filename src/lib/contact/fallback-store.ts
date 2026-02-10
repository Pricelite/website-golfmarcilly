import "server-only";

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type ContactFallbackEntry = {
  receivedAt: string;
  reason: string;
  nom: string;
  prenom: string;
  entreprise: string;
  telephone: string;
  email: string;
  message: string;
};

const FALLBACK_DIR = path.join(process.cwd(), ".contact-fallback");
const FALLBACK_FILE = path.join(FALLBACK_DIR, "submissions.ndjson");

export async function storeContactFallbackEntry(
  entry: ContactFallbackEntry
): Promise<void> {
  await mkdir(FALLBACK_DIR, { recursive: true });
  await appendFile(FALLBACK_FILE, `${JSON.stringify(entry)}\n`, "utf8");
}

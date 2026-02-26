import "server-only";

import { randomUUID } from "node:crypto";
import {
  appendFile,
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { MailerError, sendMail } from "@/lib/email/mailer";

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

type StoredFallbackEntry = ContactFallbackEntry & {
  id: string;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  lastError?: string;
};

export type FallbackQueueProcessResult = {
  processed: number;
  sent: number;
  retained: number;
  movedToFailed: number;
  pending: number;
  alertSent: boolean;
};

const FALLBACK_ROOT_DIR = path.join(process.cwd(), ".contact-fallback");
const FALLBACK_PENDING_DIR = path.join(FALLBACK_ROOT_DIR, "pending");
const FALLBACK_SENT_DIR = path.join(FALLBACK_ROOT_DIR, "sent");
const FALLBACK_FAILED_DIR = path.join(FALLBACK_ROOT_DIR, "failed");
const FALLBACK_LEGACY_FILE = path.join(FALLBACK_ROOT_DIR, "submissions.ndjson");
const FALLBACK_ALERT_STATE_FILE = path.join(FALLBACK_ROOT_DIR, "alert-state.json");

const FALLBACK_MAX_ATTEMPTS = 5;
const FALLBACK_ALERT_COOLDOWN_MS = 30 * 60 * 1000;
const FALLBACK_ALERT_PENDING_THRESHOLD = 3;
const DEFAULT_PROCESS_MAX_ITEMS = 25;

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function formatFallbackFileName(entry: StoredFallbackEntry): string {
  const timestamp = entry.createdAt.replaceAll(/[:.]/g, "-");
  return `${timestamp}-${entry.id}.json`;
}

function extractSafeErrorCode(error: unknown): string {
  if (error instanceof MailerError) {
    return `${error.code}:${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "unknown_error";
}

function buildQueueNotification(entry: ContactFallbackEntry): {
  subject: string;
  text: string;
} {
  const subject = `[Fallback][Contact] ${entry.prenom} ${entry.nom} (${entry.reason})`;
  const text = [
    "Message repasse depuis la queue de secours du site",
    "",
    `Recu initialement: ${entry.receivedAt}`,
    `Motif fallback: ${entry.reason}`,
    `Nom: ${entry.nom}`,
    `Prenom: ${entry.prenom}`,
    `Entreprise: ${entry.entreprise || "-"}`,
    `Telephone: ${entry.telephone || "-"}`,
    `Email: ${entry.email}`,
    "",
    "Message:",
    entry.message,
  ].join("\n");

  return { subject, text };
}

function buildAlertMessage(params: {
  pendingCount: number;
  failedCount: number;
  oldestPendingAgeMinutes: number | null;
}): { subject: string; text: string } {
  const subject = "[Alerte] File fallback contact non vide";
  const oldestLabel =
    params.oldestPendingAgeMinutes === null
      ? "n/a"
      : `${params.oldestPendingAgeMinutes} min`;
  const text = [
    "Alerte automatique sur la file fallback du site.",
    "",
    `Messages en attente: ${params.pendingCount}`,
    `Messages en echec definitif: ${params.failedCount}`,
    `Age du plus ancien message en attente: ${oldestLabel}`,
    "",
    "Action recommandee: verifier SMTP/Brevo et traiter la file de secours.",
  ].join("\n");

  return { subject, text };
}

async function ensureFallbackDirectories(): Promise<void> {
  await mkdir(FALLBACK_PENDING_DIR, { recursive: true });
  await mkdir(FALLBACK_SENT_DIR, { recursive: true });
  await mkdir(FALLBACK_FAILED_DIR, { recursive: true });
}

async function readStoredEntry(filePath: string): Promise<StoredFallbackEntry | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoredFallbackEntry>;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.id !== "string" ||
      typeof parsed.receivedAt !== "string" ||
      typeof parsed.reason !== "string" ||
      typeof parsed.nom !== "string" ||
      typeof parsed.prenom !== "string" ||
      typeof parsed.entreprise !== "string" ||
      typeof parsed.telephone !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.message !== "string"
    ) {
      return null;
    }

    return {
      id: parsed.id,
      createdAt:
        typeof parsed.createdAt === "string"
          ? parsed.createdAt
          : new Date().toISOString(),
      attempts:
        typeof parsed.attempts === "number" && Number.isFinite(parsed.attempts)
          ? parsed.attempts
          : 0,
      receivedAt: parsed.receivedAt,
      reason: parsed.reason,
      nom: parsed.nom,
      prenom: parsed.prenom,
      entreprise: parsed.entreprise,
      telephone: parsed.telephone,
      email: parsed.email,
      message: parsed.message,
      lastAttemptAt:
        typeof parsed.lastAttemptAt === "string" ? parsed.lastAttemptAt : undefined,
      lastError: typeof parsed.lastError === "string" ? parsed.lastError : undefined,
    };
  } catch {
    return null;
  }
}

async function moveFile(
  sourcePath: string,
  destinationDirectory: string,
  fileName: string
): Promise<void> {
  const destinationPath = path.join(destinationDirectory, fileName);
  await rename(sourcePath, destinationPath);
}

async function listQueueFiles(directory: string): Promise<string[]> {
  try {
    const files = await readdir(directory);
    return files
      .filter((fileName) => fileName.endsWith(".json"))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

async function countFailedMessages(): Promise<number> {
  const failedFiles = await listQueueFiles(FALLBACK_FAILED_DIR);
  return failedFiles.length;
}

async function getOldestPendingAgeMinutes(): Promise<number | null> {
  const pendingFiles = await listQueueFiles(FALLBACK_PENDING_DIR);
  if (pendingFiles.length === 0) {
    return null;
  }

  const oldestFilePath = path.join(FALLBACK_PENDING_DIR, pendingFiles[0]);

  try {
    const info = await stat(oldestFilePath);
    const ageMs = Date.now() - info.mtimeMs;
    return Math.max(0, Math.floor(ageMs / (60 * 1000)));
  } catch {
    return null;
  }
}

async function readLastAlertAt(): Promise<number | null> {
  try {
    const raw = await readFile(FALLBACK_ALERT_STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as { lastAlertAt?: string };
    if (!parsed.lastAlertAt) {
      return null;
    }
    const timestamp = Date.parse(parsed.lastAlertAt);
    return Number.isFinite(timestamp) ? timestamp : null;
  } catch {
    return null;
  }
}

async function writeLastAlertAt(now: Date): Promise<void> {
  await writeFile(
    FALLBACK_ALERT_STATE_FILE,
    JSON.stringify({ lastAlertAt: now.toISOString() }, null, 2),
    "utf8"
  );
}

async function maybeSendFallbackQueueAlert(): Promise<boolean> {
  const pendingFiles = await listQueueFiles(FALLBACK_PENDING_DIR);
  if (pendingFiles.length < FALLBACK_ALERT_PENDING_THRESHOLD) {
    return false;
  }

  const now = new Date();
  const lastAlertAt = await readLastAlertAt();
  if (lastAlertAt && now.getTime() - lastAlertAt < FALLBACK_ALERT_COOLDOWN_MS) {
    return false;
  }

  const alertRecipient =
    process.env.FALLBACK_QUEUE_ALERT_EMAIL?.trim() ||
    process.env.EMAIL_TO?.trim() ||
    "golf@marcilly.com";
  const alertRecipientName = process.env.EMAIL_TO_NAME?.trim() || undefined;
  const failedCount = await countFailedMessages();
  const oldestPendingAgeMinutes = await getOldestPendingAgeMinutes();
  const alertMessage = buildAlertMessage({
    pendingCount: pendingFiles.length,
    failedCount,
    oldestPendingAgeMinutes,
  });

  try {
    await sendMail({
      to: alertRecipient,
      toName: alertRecipientName,
      subject: alertMessage.subject,
      text: alertMessage.text,
    });
    await writeLastAlertAt(now);
    return true;
  } catch (error) {
    console.error("[fallback-queue] alert email failed", {
      error: extractSafeErrorCode(error),
    });
    return false;
  }
}

export async function storeContactFallbackEntry(
  entry: ContactFallbackEntry
): Promise<void> {
  await ensureFallbackDirectories();

  const storedEntry: StoredFallbackEntry = {
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  const fileName = formatFallbackFileName(storedEntry);
  const filePath = path.join(FALLBACK_PENDING_DIR, fileName);

  await writeFile(filePath, JSON.stringify(storedEntry, null, 2), "utf8");
  await appendFile(FALLBACK_LEGACY_FILE, `${JSON.stringify(entry)}\n`, "utf8");
}

export async function processContactFallbackQueue(options?: {
  maxItems?: number;
}): Promise<FallbackQueueProcessResult> {
  await ensureFallbackDirectories();

  const result: FallbackQueueProcessResult = {
    processed: 0,
    sent: 0,
    retained: 0,
    movedToFailed: 0,
    pending: 0,
    alertSent: false,
  };

  const maxItems = parsePositiveInt(
    options?.maxItems?.toString(),
    DEFAULT_PROCESS_MAX_ITEMS
  );
  const pendingFiles = await listQueueFiles(FALLBACK_PENDING_DIR);
  const processFiles = pendingFiles.slice(0, maxItems);
  const clubEmail = process.env.EMAIL_TO?.trim() || "golf@marcilly.com";
  const clubEmailName = process.env.EMAIL_TO_NAME?.trim() || undefined;

  for (const fileName of processFiles) {
    const filePath = path.join(FALLBACK_PENDING_DIR, fileName);
    result.processed += 1;

    const storedEntry = await readStoredEntry(filePath);
    if (!storedEntry) {
      await moveFile(filePath, FALLBACK_FAILED_DIR, fileName);
      result.movedToFailed += 1;
      continue;
    }

    const nextAttempt = storedEntry.attempts + 1;
    const notification = buildQueueNotification(storedEntry);

    try {
      await sendMail({
        to: clubEmail,
        toName: clubEmailName,
        subject: notification.subject,
        text: notification.text,
        replyTo: storedEntry.email,
        replyToName: `${storedEntry.prenom} ${storedEntry.nom}`.trim(),
      });

      await moveFile(filePath, FALLBACK_SENT_DIR, fileName);
      result.sent += 1;
    } catch (error) {
      const updatedEntry: StoredFallbackEntry = {
        ...storedEntry,
        attempts: nextAttempt,
        lastAttemptAt: new Date().toISOString(),
        lastError: extractSafeErrorCode(error),
      };

      if (nextAttempt >= FALLBACK_MAX_ATTEMPTS) {
        const failedPath = path.join(FALLBACK_FAILED_DIR, fileName);
        await writeFile(failedPath, JSON.stringify(updatedEntry, null, 2), "utf8");
        await unlink(filePath);
        result.movedToFailed += 1;
      } else {
        await writeFile(filePath, JSON.stringify(updatedEntry, null, 2), "utf8");
        result.retained += 1;
      }
    }
  }

  const pendingAfterProcessing = await listQueueFiles(FALLBACK_PENDING_DIR);
  result.pending = pendingAfterProcessing.length;
  result.alertSent = await maybeSendFallbackQueueAlert();

  return result;
}

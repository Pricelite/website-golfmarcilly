import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

type QueueRow = {
  id: string;
  payload: ContactFallbackEntry;
  attempts: number;
  lock_token: string;
};

export type FallbackQueueProcessResult = {
  processed: number;
  sent: number;
  retained: number;
  movedToFailed: number;
  pending: number;
  alertSent: boolean;
};

export type FallbackQueueSnapshot = {
  pending: number;
  sent: number;
  failed: number;
  oldestPendingAgeMinutes: number | null;
};

const MAX_ATTEMPTS = 5;
const DEFAULT_RETENTION_DAYS = 14;

function check(error: { message: string } | null): void {
  if (error) throw new Error(`Fallback queue unavailable: ${error.message}`);
}

function safeError(error: unknown): string {
  return error instanceof MailerError ? error.code : "send";
}

export async function storeContactFallbackEntry(entry: ContactFallbackEntry): Promise<void> {
  const { error } = await createSupabaseAdminClient().from("contact_fallback_queue").insert({ payload: entry });
  check(error);
}

export async function getContactFallbackQueueSnapshot(): Promise<FallbackQueueSnapshot> {
  const db = createSupabaseAdminClient();
  const [pending, processing, sent, failed, oldest] = await Promise.all([
    db.from("contact_fallback_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("contact_fallback_queue").select("id", { count: "exact", head: true }).eq("status", "processing"),
    db.from("contact_fallback_queue").select("id", { count: "exact", head: true }).eq("status", "sent"),
    db.from("contact_fallback_queue").select("id", { count: "exact", head: true }).eq("status", "failed"),
    db.from("contact_fallback_queue").select("created_at").in("status", ["pending", "processing"]).order("created_at").limit(1).maybeSingle(),
  ]);
  for (const result of [pending, processing, sent, failed, oldest]) check(result.error);
  return {
    pending: (pending.count ?? 0) + (processing.count ?? 0),
    sent: sent.count ?? 0,
    failed: failed.count ?? 0,
    oldestPendingAgeMinutes: oldest.data ? Math.max(0, Math.floor((Date.now() - Date.parse(oldest.data.created_at)) / 60_000)) : null,
  };
}

function notification(row: QueueRow) {
  const entry = row.payload;
  return {
    subject: `[Fallback][Contact #${row.id}] ${entry.prenom} ${entry.nom}`,
    text: [
      "Message repris depuis la file de secours du site.",
      `Référence : ${row.id}`,
      `Reçu initialement : ${entry.receivedAt}`,
      `Motif : ${entry.reason}`,
      `Nom : ${entry.nom}`,
      `Prénom : ${entry.prenom}`,
      `Entreprise : ${entry.entreprise || "-"}`,
      `Téléphone : ${entry.telephone || "-"}`,
      `Email : ${entry.email}`,
      "", entry.message,
    ].join("\n"),
  };
}

async function updateClaim(row: QueueRow, values: Record<string, unknown>): Promise<void> {
  const { data, error } = await createSupabaseAdminClient().from("contact_fallback_queue")
    .update({ ...values, lock_token: null, locked_until: null, updated_at: new Date().toISOString() })
    .eq("id", row.id).eq("lock_token", row.lock_token).eq("status", "processing")
    .select("id").maybeSingle();
  check(error);
  if (!data) throw new Error("Fallback queue claim expired before acknowledgement");
}

async function maybeAlert(snapshot: FallbackQueueSnapshot): Promise<boolean> {
  if (snapshot.pending < 3) return false;
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("contact_fallback_alert_state").select("last_alert_at").eq("id", 1).maybeSingle();
  check(error);
  if (data && Date.now() - Date.parse(data.last_alert_at) < 30 * 60_000) return false;
  try {
    await sendMail({
      to: process.env.FALLBACK_QUEUE_ALERT_EMAIL?.trim() || process.env.EMAIL_TO?.trim() || "golf@marcilly.com",
      subject: "[Alerte] File de secours contact non vide",
      text: `${snapshot.pending} demande(s) en attente ; ${snapshot.failed} en échec. Vérifiez la messagerie et traitez la file.`,
    });
    const saved = await db.from("contact_fallback_alert_state").upsert({ id: 1, last_alert_at: new Date().toISOString() });
    check(saved.error);
    return true;
  } catch {
    return false;
  }
}

export async function processContactFallbackQueue(options?: { maxItems?: number }): Promise<FallbackQueueProcessResult> {
  const db = createSupabaseAdminClient();
  const maxItems = Math.min(Math.max(1, options?.maxItems ?? 25), 100);
  const { data, error } = await db.rpc("claim_contact_fallback", { p_max_items: maxItems });
  check(error);
  const rows = (data ?? []) as QueueRow[];
  const result: FallbackQueueProcessResult = { processed: 0, sent: 0, retained: 0, movedToFailed: 0, pending: 0, alertSent: false };

  for (const row of rows) {
    result.processed += 1;
    const mail = notification(row);
    try {
      await sendMail({
        to: process.env.EMAIL_TO?.trim() || "golf@marcilly.com",
        ...mail,
        replyTo: row.payload.email,
        replyToName: `${row.payload.prenom} ${row.payload.nom}`.trim(),
      });
    } catch (sendError) {
      const failed = row.attempts >= MAX_ATTEMPTS;
      await updateClaim(row, { status: failed ? "failed" : "pending", last_error: safeError(sendError) });
      if (failed) result.movedToFailed += 1;
      else result.retained += 1;
      continue;
    }
    await updateClaim(row, { status: "sent" });
    result.sent += 1;
  }

  const retentionDaysRaw = Number.parseInt(process.env.FALLBACK_QUEUE_RETENTION_DAYS || "", 10);
  const retentionDays = Number.isInteger(retentionDaysRaw) && retentionDaysRaw > 0 ? retentionDaysRaw : DEFAULT_RETENTION_DAYS;
  const cutoff = new Date(Date.now() - retentionDays * 86_400_000).toISOString();
  const purge = await db.from("contact_fallback_queue").delete().in("status", ["sent", "failed"]).lt("updated_at", cutoff);
  check(purge.error);

  const snapshot = await getContactFallbackQueueSnapshot();
  result.pending = snapshot.pending;
  result.alertSent = await maybeAlert(snapshot);
  return result;
}

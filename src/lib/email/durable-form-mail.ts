import "server-only";
import { createHash } from "node:crypto";
import { storeContactFallbackEntry, type ContactFallbackEntry } from "@/lib/contact/fallback-store";
import { consumeRateLimit, releaseRateLimit } from "@/lib/security/request-guards";
import { sendMail } from "./mailer";
import { deliverDurably } from "./durable-delivery";

export async function sendDurableFormMail(options: {
  namespace: string;
  fingerprint?: string;
  mail: Parameters<typeof sendMail>[0];
  entry: Omit<ContactFallbackEntry, "receivedAt">;
}) {
  const fingerprint = options.fingerprint ?? createHash("sha256")
    .update(JSON.stringify([options.mail.to, options.mail.subject, options.mail.text])).digest("hex");
  return deliverDurably({
    claim: () => consumeRateLimit({ namespace: options.namespace, identifier: fingerprint, limit: 1, windowMs: 600_000 }),
    send: () => sendMail(options.mail),
    store: () => storeContactFallbackEntry({ ...options.entry, receivedAt: new Date().toISOString() }),
    release: () => releaseRateLimit(options.namespace, fingerprint),
  });
}

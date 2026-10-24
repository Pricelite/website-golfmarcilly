export class DeliveryClaimError extends Error {
  constructor(readonly unavailable: boolean, readonly retryAfterSeconds: number) {
    super(unavailable
      ? "Le service est momentanément indisponible. Réessayez plus tard."
      : "Cette demande est déjà en cours ou vient d’être enregistrée. Contactez le golf avant de la renouveler.");
  }
}

/** Only report acceptance once the mail was sent or the complete request persisted. */
export async function deliverDurably(operations: {
  claim: () => Promise<{ allowed: boolean; unavailable?: boolean; retryAfterSeconds: number }>;
  send: () => Promise<void>;
  store: () => Promise<void>;
  release: () => Promise<void>;
}): Promise<{ queued: boolean }> {
  const claim = await operations.claim();
  if (!claim.allowed) throw new DeliveryClaimError(Boolean(claim.unavailable), claim.retryAfterSeconds);
  try {
    await operations.send();
    return { queued: false };
  } catch (sendError) {
    try {
      await operations.store();
      return { queued: true };
    } catch {
      // A failed release leaves a short-lived claim, never an accepted request.
      await operations.release().catch(() => {});
      throw sendError;
    }
  }
}

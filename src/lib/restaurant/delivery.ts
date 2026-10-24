import { createHash } from "node:crypto";
import type { ReservationRequestBody } from "./validation";

export function restaurantRequestFingerprint(request: ReservationRequestBody): string {
  return createHash("sha256").update(JSON.stringify([
    request.day, request.time, request.name, request.email, request.phone || "",
    request.partySize, request.message || "",
  ])).digest("hex");
}

/** An acknowledgement failure must not turn an already delivered request into a retry. */
export async function deliverRestaurantRequest(
  sendRequest: () => Promise<{ queued: boolean }>,
  sendAcknowledgement: () => Promise<void>,
): Promise<{ queued: boolean; acknowledgementSent: boolean }> {
  const result = await sendRequest();
  if (result.queued) return { queued: true, acknowledgementSent: false };
  try {
    await sendAcknowledgement();
    return { queued: false, acknowledgementSent: true };
  } catch {
    return { queued: false, acknowledgementSent: false };
  }
}

import "server-only";
import { parseInitiationOptions } from "./calendar-options";

export async function getInitiationOptions() {
  try {
    const url = new URL(process.env.INITIATION_CALENDAR_ICS_URL?.trim() || "");
    if (url.protocol !== "https:" || url.hostname !== "calendar.google.com" || !url.pathname.startsWith("/calendar/ical/")) throw new Error("Invalid source");
    const response = await fetch(url, { cache: "no-store", redirect: "error", headers: { Accept: "text/calendar" }, signal: AbortSignal.timeout(12_000) });
    if (!response.ok) throw new Error("Calendar unavailable");
    return await parseInitiationOptions(await response.text());
  } catch {
    // Never expose the private feed URL in responses or logs.
    throw new Error("Le planning est momentanément indisponible. Réessayez dans quelques instants ou contactez le golf.");
  }
}

import "server-only";
import { parseInitiationOptions } from "./calendar-options";
import { parisDate } from "./request";

export async function getInitiationOptions() {
  if (process.env.PREVIEW_MODE === "true") {
    return [7, 14, 21].map(days => ({ date: parisDate(new Date(Date.now() + days * 86_400_000)), time: "10:00" }));
  }
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

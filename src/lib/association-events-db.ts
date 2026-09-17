import "server-only";
import { associationEvents, type AssociationEvent } from "@/data/association-events";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EventInput } from "./association-events-validation";

export class CalendarStoreError extends Error {
  constructor(public readonly reason: "setup" | "unavailable" | "not_found") {
    super(reason);
  }
}

type EventRow = {
  id: string; title: string; start_date: string; end_date: string | null;
  start_time: string | null; note: string | null; status: "private" | "provisional" | null;
};
const columns = "id,title,start_date,end_date,start_time,note,status";

function client() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) throw new CalendarStoreError("setup");
  return createSupabaseAdminClient();
}

function checkError(error: { code?: string } | null) {
  if (error) throw new CalendarStoreError(error.code === "42P01" || error.code === "PGRST205" ? "setup" : "unavailable");
}

function fromRow(row: EventRow): AssociationEvent {
  return { id: row.id, title: row.title, start: row.start_date, end: row.end_date ?? undefined,
    time: row.start_time?.slice(0, 5), note: row.note ?? undefined, status: row.status ?? undefined };
}

function toRow(event: EventInput) {
  return { title: event.title, start_date: event.start, end_date: event.end ?? null,
    start_time: event.time ?? null, note: event.note ?? null, status: event.status ?? null };
}

export async function listAssociationEvents(): Promise<AssociationEvent[]> {
  const db = client();
  const events: AssociationEvent[] = [];
  // Supabase limite les réponses : parcourir toutes les pages, y compris les archives.
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.from("association_events").select(columns)
      .order("start_date").order("id").range(offset, offset + 499);
    checkError(error);
    const rows = (data ?? []) as EventRow[];
    events.push(...rows.map(fromRow));
    if (rows.length < 500) return events;
  }
}

export async function publicAssociationEvents(): Promise<{ events: AssociationEvent[]; unavailable: boolean }> {
  try {
    return { events: await listAssociationEvents(), unavailable: false };
  } catch (error) {
    // Repli uniquement avant installation. Une base vide signifie un calendrier vide.
    if (error instanceof CalendarStoreError && error.reason === "setup") return { events: associationEvents, unavailable: false };
    return { events: [], unavailable: true };
  }
}

export async function saveAssociationEvent(event: EventInput, id?: string) {
  const db = client();
  const query = id
    ? db.from("association_events").update(toRow(event)).eq("id", id)
    : db.from("association_events").insert({ ...toRow(event), id: crypto.randomUUID() });
  const { data, error } = await query.select(columns).maybeSingle();
  checkError(error);
  if (!data) throw new CalendarStoreError("not_found");
  return fromRow(data as EventRow);
}

export async function deleteAssociationEvent(id: string) {
  const { data, error } = await client().from("association_events").delete().eq("id", id).select("id").maybeSingle();
  checkError(error);
  if (!data) throw new CalendarStoreError("not_found");
}

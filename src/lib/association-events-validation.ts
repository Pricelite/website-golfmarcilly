import type { AssociationEvent } from "@/data/association-events";

export type EventInput = Omit<AssociationEvent, "id">;

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01" || value > "2199-12-31") return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseEventInput(value: unknown): { ok: true; event: EventInput } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "Compétition invalide." };
  const input = value as Record<string, unknown>;
  for (const key of ["title", "start", "end", "time", "note", "status"]) {
    if (input[key] !== undefined && typeof input[key] !== "string") return { ok: false, error: "Les champs doivent contenir du texte." };
  }
  const title = (input.title as string | undefined)?.trim() ?? "";
  const start = (input.start as string | undefined) ?? "";
  const end = (input.end as string | undefined) || undefined;
  const time = (input.time as string | undefined) || undefined;
  const note = (input.note as string | undefined)?.trim() || undefined;
  const status = (input.status as string | undefined) || undefined;
  if (!title || title.length > 160) return { ok: false, error: "Indiquez un nom de 1 à 160 caractères." };
  if (!validDate(start) || (end && !validDate(end))) return { ok: false, error: "Indiquez des dates valides entre 1900 et 2199." };
  if (end && end < start) return { ok: false, error: "La date de fin doit être égale ou postérieure à la date de début." };
  if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return { ok: false, error: "Indiquez un horaire valide." };
  if (note && note.length > 2000) return { ok: false, error: "La description est limitée à 2 000 caractères." };
  if (status !== undefined && status !== "private" && status !== "provisional") return { ok: false, error: "Choisissez un statut valide." };
  return { ok: true, event: { title, start, end, time, note, status } };
}

export function validEventId(value: unknown): value is string {
  return typeof value === "string" && /^[a-zA-Z0-9-]{1,80}$/.test(value);
}

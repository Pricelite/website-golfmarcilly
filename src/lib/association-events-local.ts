import "server-only";
import { readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { associationEvents, type AssociationEvent } from "@/data/association-events";
import type { EventInput } from "./association-events-validation";
import { localContentStoreEnabled } from "./supabase/content";

const localFile = join(process.cwd(), ".local-association-events-2027.json");
let pendingWrite: Promise<unknown> = Promise.resolve();

export function localCalendarEnabled() {
  return localContentStoreEnabled();
}

export async function readLocalCalendar(): Promise<AssociationEvent[]> {
  let events: unknown;
  try {
    events = JSON.parse(await readFile(localFile, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    events = associationEvents.map(event => ({ ...event }));
  }
  if (!Array.isArray(events) || events.some(event => !event || typeof event !== "object" ||
    typeof event.id !== "string" || typeof event.title !== "string" || typeof event.start !== "string")) {
    throw new Error("Invalid local calendar");
  }
  return (events as AssociationEvent[]).filter(event => event.start >= "2027-01-01")
    .sort((a, b) => a.start.localeCompare(b.start) || a.id.localeCompare(b.id));
}

function updateLocalCalendar<T>(change: (events: AssociationEvent[]) => T): Promise<T> {
  const operation = pendingWrite.then(async () => {
    const events = await readLocalCalendar();
    const result = change(events);
    const temporary = `${localFile}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(events, null, 2)}\n`, "utf8");
    await rename(temporary, localFile);
    return result;
  });
  pendingWrite = operation.catch(() => {});
  return operation;
}

export function saveLocalEvent(event: EventInput, id?: string): Promise<AssociationEvent | null> {
  return updateLocalCalendar(events => {
    const index = id ? events.findIndex(item => item.id === id) : -1;
    if (id && index === -1) return null;
    const saved = { ...event, id: id ?? crypto.randomUUID() };
    if (index === -1) events.push(saved);
    else events[index] = saved;
    return saved;
  });
}

export function deleteLocalEvent(id: string): Promise<boolean> {
  return updateLocalCalendar(events => {
    const index = events.findIndex(event => event.id === id);
    if (index === -1) return false;
    events.splice(index, 1);
    return true;
  });
}

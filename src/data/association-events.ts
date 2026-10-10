import agenda2027 from "./association-events-2027.json";

export type AssociationEvent = {
  id: string;
  title: string;
  start: string;
  end?: string; // Inclusive final day, YYYY-MM-DD.
  time?: string;
  note?: string;
  status?: "private" | "provisional" | "unconfirmed" | "confirmed";
};

// The owner-supplied 2027 agenda is the fallback before Supabase setup.
// Once configured, updates are made through /admin/competitions.
export const associationEvents2027: AssociationEvent[] = agenda2027 as AssociationEvent[];
export const associationEvents: AssociationEvent[] = associationEvents2027;

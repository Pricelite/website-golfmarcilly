import { conditionItems, type ConditionId, type ConditionStatus, type SiteCondition } from "@/data/site-conditions";

export type ConditionInput = { id: ConditionId; status: ConditionStatus; reason: string | null };

export function parseConditionInput(value: unknown): { ok: true; condition: ConditionInput } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "État invalide." };
  const input = value as Record<string, unknown>;
  if (!conditionItems.some(item => item.id === input.id)) return { ok: false, error: "Équipement inconnu." };
  if (!["open", "closed", "unknown"].includes(input.status as string)) return { ok: false, error: "Choisissez un état valide." };
  if (input.reason !== undefined && typeof input.reason !== "string") return { ok: false, error: "Le motif doit être du texte." };
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  if (reason.length > 240) return { ok: false, error: "Le motif est limité à 240 caractères." };
  if (input.status === "closed" && !reason) return { ok: false, error: "Indiquez la raison de cette fermeture." };
  return { ok: true, condition: { id: input.id as ConditionId, status: input.status as ConditionStatus, reason: input.status === "unknown" ? null : reason || null } };
}

export function parisDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function visibleCondition(condition: SiteCondition): SiteCondition {
  // Unset and explicitly unknown states remain unconfirmed until the team updates them.
  return condition;
}

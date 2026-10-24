import { conditionItems, type ConditionId, type ConditionState, type ConditionStatus, type SiteCondition } from "@/data/site-conditions";

export type ConditionInput = { id: ConditionId; status: ConditionStatus; stateLabel: string | null; reason: string | null };

export function parseConditionInput(value: unknown, ids: readonly string[] = conditionItems.map(item => item.id), states?: ConditionState[]): { ok: true; condition: ConditionInput } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "État invalide." };
  const input = value as Record<string, unknown>;
  if (typeof input.id !== "string" || !ids.includes(input.id)) return { ok: false, error: "Équipement inconnu." };
  if (!["open", "closed", "unknown"].includes(input.status as string)) return { ok: false, error: "Choisissez un état valide." };
  if (input.reason !== undefined && typeof input.reason !== "string") return { ok: false, error: "Le motif doit être du texte." };
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  if (reason.length > 240) return { ok: false, error: "Le motif est limité à 240 caractères." };
  if (input.status === "closed" && !reason) return { ok: false, error: "Indiquez la raison de cette fermeture." };
  let stateLabel: string | null = null;
  if (input.stateId !== undefined) {
    if (typeof input.stateId !== "string" || !states) return { ok: false, error: "État personnalisé invalide." };
    const state = states.find(item => item.id === input.stateId);
    if (!state || state.status !== input.status) return { ok: false, error: "État personnalisé invalide." };
    stateLabel = ["open", "closed", "unknown"].includes(state.id) ? null : state.label;
  } else if (input.status === "open" && reason === "Carotté") {
    stateLabel = "Carotté";
  }
  return { ok: true, condition: { id: input.id, status: input.status as ConditionStatus, stateLabel, reason: input.status === "unknown" ? null : reason || null } };
}

export function parseConditionItem(value: unknown): { ok: true; item: ConditionItemInput } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "Équipement invalide." };
  const input = value as Record<string, unknown>;
  if (typeof input.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.id) || input.id.length > 80 ||
      typeof input.label !== "string" || !input.label.trim() || input.label.trim().length > 100 ||
      !["courses", "services"].includes(input.group as string) ||
      typeof input.href !== "string" || !/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(input.href) || input.href.length > 200) {
    return { ok: false, error: "Renseignez un identifiant, un nom, un groupe et un lien interne valides." };
  }
  return { ok: true, item: { id: input.id, label: input.label.trim(), group: input.group as "courses" | "services", href: input.href } };
}
export type ConditionItemInput = { id: string; label: string; group: "courses" | "services"; href: string };

export function parseConditionState(value: unknown): { ok: true; state: ConditionState } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "État invalide." };
  const input = value as Record<string, unknown>;
  if (typeof input.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.id) || input.id.length > 60 ||
      typeof input.label !== "string" || !input.label.trim() || input.label.trim().length > 60 ||
      !["open", "closed", "unknown"].includes(input.status as string)) return { ok: false, error: "Nom ou type d’état invalide." };
  return { ok: true, state: { id: input.id, label: input.label.trim(), status: input.status as ConditionStatus } };
}

export function parisDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function visibleCondition(condition: SiteCondition): SiteCondition {
  return condition;
}

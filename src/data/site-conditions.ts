export const conditionItems = [
  { id: "grand-parcours-aller", label: "Grand parcours aller", group: "courses", href: "/golf" },
  { id: "grand-parcours-retour", label: "Grand parcours retour", group: "courses", href: "/golf" },
  { id: "parcours-decouverte-9-trous", label: "Parcours découverte · 9 trous", group: "courses", href: "/golf" },
  { id: "pitch-and-putt", label: "Kaleka course aller", group: "courses", href: "/golf" },
  { id: "kaleke", label: "Kaleka course retour", group: "courses", href: "/golf" },
  { id: "practice", label: "Practice", group: "courses", href: "/golf" },
  { id: "restaurant", label: "Restaurant La Bergerie", group: "services", href: "/restaurant" },
  { id: "voiturettes", label: "Voiturettes", group: "services", href: "/golf" },
  { id: "chariots", label: "Chariots", group: "services", href: "/golf" },
] as const;

export type ConditionId = string;
export type ConditionStatus = "open" | "closed" | "unknown";
export type ConditionGroup = "courses" | "services";
export type ConditionItem = { id: string; label: string; group: ConditionGroup; href: string; position: number };
export type ConditionState = { id: string; label: string; status: ConditionStatus };
export const defaultStates: ConditionState[] = [
  { id: "open", label: "Ouvert", status: "open" },
  { id: "closed", label: "Fermé", status: "closed" },
  { id: "unknown", label: "À confirmer", status: "unknown" },
  { id: "carotte", label: "Carotté", status: "open" },
];
export type SiteCondition = ConditionItem & {
  status: ConditionStatus;
  stateLabel: string | null;
  reason: string | null;
  updatedAt: string | null;
};

export function emptyConditions(): SiteCondition[] {
  return conditionItems.map((item, position) => ({ ...item, position, status: "unknown", stateLabel: null, reason: null, updatedAt: null }));
}

export function previewConditions(): SiteCondition[] {
  return emptyConditions().map(condition => ({
    ...condition,
    status: "open",
    stateLabel: condition.id === "grand-parcours-aller" ? "Carotté" : null,
    reason: null,
  }));
}

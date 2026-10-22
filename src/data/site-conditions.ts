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

export type ConditionId = (typeof conditionItems)[number]["id"];
export type ConditionStatus = "open" | "closed" | "unknown";
export type SiteCondition = {
  id: ConditionId;
  status: ConditionStatus;
  reason: string | null;
  updatedAt: string | null;
};

export function emptyConditions(): SiteCondition[] {
  return conditionItems.map(item => ({ id: item.id, status: "open", reason: null, updatedAt: null }));
}

export function previewConditions(): SiteCondition[] {
  return emptyConditions().map(condition => condition.id === "grand-parcours-aller"
    ? { ...condition, reason: "Carotté" }
    : condition);
}

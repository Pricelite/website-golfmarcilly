export const RESTAURANT_ID = "la-bergerie";
export const RESTAURANT_NAME = "La Bergerie";
export const RESTAURANT_ADMIN_ROLE = "restaurant_admin";
export const adminSections = ["restaurant", "competitions", "site_conditions", "publicites", "statistiques", "archives", "pages", "media"] as const;
export type AdminSection = (typeof adminSections)[number];
export const sectionLabels: Record<AdminSection, string> = {
  restaurant: "Restaurant La Bergerie", competitions: "Calendrier", site_conditions: "État du golf",
  publicites: "Publicités", statistiques: "Statistiques", archives: "Archives des initiations",
  pages: "Pages du site", media: "Médiathèque",
};

export type RestaurantActor = {
  id: string;
  email: string | null;
  username: string | null;
  name: string;
  role: string;
  restaurantId: string;
  active: boolean;
  sections: AdminSection[];
};

export function parseAdminSections(value: unknown): AdminSection[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > adminSections.length ||
      !value.every(section => typeof section === "string" && adminSections.includes(section as AdminSection))) return null;
  const unique = [...new Set(value)] as AdminSection[];
  return unique.length === value.length ? unique : null;
}

export function canAccessAdminSection(actor: RestaurantActor | null, section: AdminSection): boolean {
  return actor?.active === true && [RESTAURANT_ADMIN_ROLE, "staff"].includes(actor.role) &&
    actor.sections.includes(section) && (section !== "restaurant" || actor.restaurantId === RESTAURANT_ID);
}

export function canManageRestaurant(actor: RestaurantActor | null, restaurantId: string): boolean {
  return restaurantId === RESTAURANT_ID && canAccessAdminSection(actor, "restaurant");
}

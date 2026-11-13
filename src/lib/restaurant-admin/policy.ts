export const RESTAURANT_ID = "la-bergerie";
export const RESTAURANT_NAME = "La Bergerie";
export const RESTAURANT_ADMIN_ROLE = "restaurant_admin";

export type RestaurantActor = {
  id: string;
  email: string | null;
  username: string | null;
  name: string;
  role: string;
  restaurantId: string;
  active: boolean;
};

export function canManageRestaurant(actor: RestaurantActor | null, restaurantId: string): boolean {
  return actor?.active === true && actor.role === RESTAURANT_ADMIN_ROLE && actor.restaurantId === restaurantId && restaurantId === RESTAURANT_ID;
}

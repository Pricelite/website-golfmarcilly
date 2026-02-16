export type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export type RestaurantReservationEnv = {
  restaurantReservationTo: string;
  restaurantReservationToName?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  if (!value) {
    return undefined;
  }

  return value;
}

export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return { url, anonKey };
}

export function getRestaurantReservationEnv(): RestaurantReservationEnv {
  const emailTo =
    getOptionalEnv("RESTAURANT_RESERVATION_EMAIL_TO") ||
    getOptionalEnv("EMAIL_TO");

  if (!emailTo || !EMAIL_PATTERN.test(emailTo)) {
    throw new Error(
      "Missing restaurant reservation env var: RESTAURANT_RESERVATION_EMAIL_TO (or EMAIL_TO fallback)."
    );
  }

  const emailToName =
    getOptionalEnv("RESTAURANT_RESERVATION_EMAIL_TO_NAME") ||
    getOptionalEnv("EMAIL_TO_NAME");

  return {
    restaurantReservationTo: emailTo,
    restaurantReservationToName: emailToName,
  };
}

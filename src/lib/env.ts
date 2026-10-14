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

export function getRestaurantReservationEnv(): RestaurantReservationEnv {
  const emailTo =
    getOptionalEnv("RESTAURANT_RESERVATION_EMAIL_TO") ||
    "golf@marcilly.com";

  if (!emailTo || !EMAIL_PATTERN.test(emailTo)) {
    throw new Error(
      "Invalid restaurant reservation env var: RESTAURANT_RESERVATION_EMAIL_TO."
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

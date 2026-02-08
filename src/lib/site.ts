export const SITE_NAME = "Golf de Marcilly-Orléans";
export const SITE_DESCRIPTION =
  "Un parcours 18 trous au cœur de la Sologne, un club house chaleureux et des services premium pour tous les golfeurs.";
export const SITE_LOCALE = "fr_FR";

export const RESERVATION_URL = "https://prima.golf/marcilly/login";

export const CONTACT_EMAIL = "golf@marcilly.com";
export const CONTACT_PHONE_DISPLAY = "02 38 76 11 73";
export const CONTACT_PHONE = "+33238761173";
export const CONTACT_ADDRESS = "829 domaine de la Plaine, 45240 Marcilly-en-Villette";
export const CONTACT_EMAIL_LINK = `mailto:${CONTACT_EMAIL}`;
export const CONTACT_PHONE_LINK = `tel:${CONTACT_PHONE}`;

export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;

  if (raw) {
    try {
      return new URL(raw).toString().replace(/\/$/, "");
    } catch {
      // Ignore invalid URLs and fall back to localhost.
    }
  }

  return "http://localhost:3000";
}

export function getMetadataBase() {
  return new URL(getSiteUrl());
}

export type SiteOffer = {
  slug: string;
  title: string;
  imageSrc: string;
  description: string;
  badgeLabel: string;
  eyebrow: string;
  promoPrice?: string;
  originalPrice?: string;
  actionLabel: string;
  actionHref: string;
  expiresOn?: string;
};

// Aucune offre publiée : retrait demandé par le propriétaire le 19 octobre 2026.
export const siteOffers: SiteOffer[] = [];

// 1er novembre 2026 à 9 h, heure de Paris (UTC+1 à cette date).
export const blackFriday2026OpensAt = "2026-11-01T08:00:00.000Z";

// Visuels annoncés pour novembre 2026, distincts des offres actuellement actives.
export const upcomingOfferPosters = [
  {
    src: "/images/black-friday-2026-abonnements.png",
    alt: "Black Friday 2026 : abonnements 27 trous compact à 605 €, 45 trous 5 jours sur 7 à 875 €, 45 trous individuel 7 jours sur 7 à 1 075 € et couple à 1 930 €.",
    title: "Abonnements",
    width: 941,
    height: 1672,
  },
  {
    src: "/images/black-friday-2026-practice.png",
    alt: "Black Friday 2026 : 25 seaux achetés et 11 offerts à 50 €, ou 50 seaux achetés et 25 offerts à 95 €.",
    title: "Seaux de practice",
    width: 1086,
    height: 1448,
  },
] as const;

export function getActiveSiteOffers(now = new Date()) {
  const parisDay = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
  return siteOffers.filter((offer) => !offer.expiresOn || parisDay <= offer.expiresOn);
}

export function getSiteOfferBySlug(slug: string, now = new Date()) {
  return getActiveSiteOffers(now).find((offer) => offer.slug === slug);
}

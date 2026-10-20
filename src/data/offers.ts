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

export function getActiveSiteOffers(now = new Date()) {
  const parisDay = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
  return siteOffers.filter((offer) => !offer.expiresOn || parisDay <= offer.expiresOn);
}

export function getSiteOfferBySlug(slug: string, now = new Date()) {
  return getActiveSiteOffers(now).find((offer) => offer.slug === slug);
}

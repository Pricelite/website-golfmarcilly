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
};

// Les affiches fournies sont la source des tarifs et conditions ci-dessous.
// Le carrousel, les pages d'offres et le sitemap utilisent cette liste.
export const siteOffers: SiteOffer[] = [
  {
    slug: "abonnement-900",
    title: "Votre abonnement 45 trous à 900 €",
    imageSrc: "/offers/abonnement-900.png",
    description:
      "Accès aux 45 trous 7 jours sur 7, pour 900 € ou 12 mensualités de 75 €. Vous payez 8 mois et jouez 12 mois. Offre réservée aux 30 premiers nouveaux abonnés, non abonnés en 2026. Renseignements à l’accueil du golf.",
    badgeLabel: "Nouveaux abonnés",
    eyebrow: "Abonnement 45 trous · 7 jours sur 7",
    promoPrice: "900 €",
    actionLabel: "Me renseigner sur l’abonnement",
    actionHref: "/contact#reservation",
  },
  {
    slug: "tarifs-septembre",
    title: "Profitez des tarifs de septembre",
    imageSrc: "/offers/tarifs-septembre.png",
    description:
      "Tout le mois de septembre : 10 € les 9 trous sur le Pitch and Putt, le Kaleka ou le parcours Découverte. Sur le Grand Parcours : 20 € les 9 trous aller ou les 9 trous retour, et 39 € les 18 trous.",
    badgeLabel: "Tout septembre",
    eyebrow: "Tarifs des parcours",
    promoPrice: "Dès 10 €",
    actionLabel: "Réserver un départ",
    actionHref: "https://marcilly.reservations-golf.fr/",
  },
];

export function getSiteOfferBySlug(slug: string) {
  return siteOffers.find((offer) => offer.slug === slug);
}

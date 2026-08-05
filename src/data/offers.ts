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

// Pour ajouter une nouvelle offre :
// 1. Déposer l'image dans public/offers/
// 2. Copier un bloc ci-dessous
// 3. Changer slug, title, imageSrc, description, prix et lien
// 4. Le carrousel et la page /offres/[slug] seront mis à jour automatiquement
export const siteOffers: SiteOffer[] = [
  {
    slug: "offre-decouverte",
    title: "Débutant, notre priorité",
    imageSrc: "/offers/debutant.jpg",
    description:
      "Deux seaux de balles d'entraînement ou un parcours découverte pour progresser à votre rythme dans un cadre accessible à tous.",
    badgeLabel: "Offre limitée",
    eyebrow: "Expérience débutant",
    promoPrice: "6 € et 10 €",
    actionLabel: "Nous contacter",
    actionHref: "/contact#reservation",
  },
  {
    slug: "offre-79",
    title: "30 jours pour tomber amoureux du golf",
    imageSrc: "/offers/offre-79.png",
    description:
      "Une formule tout compris sans engagement avec parcours débutant illimité, carte de 25 seaux et accès libre aux zones d'entraînement.",
    badgeLabel: "Offre limitée",
    eyebrow: "Formule 30 jours",
    promoPrice: "79 €",
    actionLabel: "Réserver un départ",
    actionHref: "https://marcilly.reservations-golf.fr/",
  },
  {
    slug: "offre-129",
    title: "30 jours 45 trous tout compris",
    imageSrc: "/offers/offre-129.png",
    description:
      "Un mois de golf en illimité sur 45 trous, avec carte de seaux et accès libre aux zones d'entraînement, sans engagement.",
    badgeLabel: "Offre limitée",
    eyebrow: "Formule 45 trous",
    promoPrice: "129 €",
    actionLabel: "Réserver un départ",
    actionHref: "https://marcilly.reservations-golf.fr/",
  },
];

export function getSiteOfferBySlug(slug: string) {
  return siteOffers.find((offer) => offer.slug === slug);
}

/** Publicités de l'accueil. Les images doivent être placées dans public/. */
export type HomeAd = {
  advertiser: string;
  image: string;
  imageAlt: string;
  url: string;
  /** Les exemples du golf restent des liens internes, sans mention de publicité payante. */
  kind?: "example";
  /** Dates inclusives au format AAAA-MM-JJ, dans le fuseau Europe/Paris. */
  startsOn?: string;
  endsOn?: string;
};

export const homeAds: { left: HomeAd | null; right: HomeAd | null } = {
  left: {
    advertiser: "La Bergerie",
    image: "/restaurant/gallery/bar.webp",
    imageAlt: "La salle du restaurant La Bergerie",
    url: "/restaurant",
    kind: "example",
  },
  right: {
    advertiser: "Séminaires au golf",
    image: "/images/seminaire-conference-marcilly.webp",
    imageAlt: "Une conférence réunissant de nombreux participants",
    url: "/evenements",
    kind: "example",
  },
};

export function visibleHomeAd(ad: HomeAd | null, today: string): HomeAd | null {
  if (!ad || (ad.startsOn && today < ad.startsOn) || (ad.endsOn && today > ad.endsOn)) return null;
  return ad;
}

/** Publicités de l'accueil. Les images doivent être placées dans public/. */
export type HomeAd = {
  advertiser: string;
  image: string;
  imageAlt: string;
  url?: string;
  caption?: string;
  /** Les annonces internes et événements ne sont pas présentés comme des publicités payantes. */
  kind?: "example" | "event" | "house";
  /** Dates inclusives au format AAAA-MM-JJ, dans le fuseau Europe/Paris. */
  startsOn?: string;
  endsOn?: string;
};

export const homeAds: { left: HomeAd[]; right: HomeAd[] } = {
  left: [
    {
      advertiser: "US Orléans – Villefranche",
      image: "/ads/uso-villefranche-2026.png",
      imageAlt: "Affiche du match US Orléans – Villefranche du 31 octobre 2026 à 14 h 45, spécial Halloween",
      url: "https://orleansloiretfoot.com/",
      caption: "31 octobre · 14 h 45",
      kind: "event",
      endsOn: "2026-10-31",
    },
  ],
  right: [
    {
      advertiser: "Black Friday au golf",
      image: "/ads/black-friday-2026.png",
      imageAlt: "Affiche Black Friday du Golf de Marcilly annonçant l’arrivée prochaine des offres",
      caption: "Dès le 1er novembre",
      kind: "house",
      endsOn: "2026-10-31",
    },
  ],
};

export function visibleHomeAd(ad: HomeAd | null, today: string): HomeAd | null {
  if (!ad || (ad.startsOn && today < ad.startsOn) || (ad.endsOn && today > ad.endsOn)) return null;
  return ad;
}

export function visibleHomeAds(ads: HomeAd[], today: string): HomeAd[] {
  return ads.filter(ad => visibleHomeAd(ad, today));
}

/** Publicités de l'accueil. Les images doivent être placées dans public/. */
export type HomeAd = {
  id?: string;
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

export type ManagedHomeAd = HomeAd & {
  id: string;
  side: "left" | "right" | "both";
  enabled: boolean;
  position: number;
};

export function defaultManagedHomeAds(): ManagedHomeAd[] {
  return [
    ...homeAds.left.map((ad, index) => ({ ...ad, id: `default-left-${index}`, side: "left" as const, enabled: true, position: index * 10 })),
    ...homeAds.right.map((ad, index) => ({ ...ad, id: `default-right-${index}`, side: "right" as const, enabled: true, position: index * 10 })),
  ];
}

export function managedAdsForSide(ads: ManagedHomeAd[], side: "left" | "right", today: string): HomeAd[] {
  return ads.filter(ad => ad.enabled && (ad.side === side || ad.side === "both") && visibleHomeAd(ad, today))
    .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
}

export const homeAds: { left: HomeAd[]; right: HomeAd[] } = {
  left: [
    {
      advertiser: "Rugby et fléchettes au club-house",
      image: "/ads/rugby-france-afrique-du-sud-2026.png",
      imageAlt: "Affiche de la retransmission France – Afrique du Sud le vendredi 13 novembre à 21 h 10 au club-house, avec une soirée fléchettes sur réservation",
      caption: "Vendredi 13 novembre · 21 h 10",
      kind: "event",
      endsOn: "2026-11-13",
    },
  ],
  right: [
    {
      advertiser: "Horaires d'hiver du golf",
      image: "/ads/horaires-hiver.svg",
      imageAlt: "Horaires d'hiver du 1er novembre au 10 mars : de 9 h à 18 h du lundi au vendredi et de 9 h à 19 h le samedi et le dimanche",
      caption: "Du 1er novembre au 10 mars",
      kind: "house",
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

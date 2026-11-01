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
      advertiser: "Nouveaux horaires du golf",
      image: "/ads/nouveaux-horaires-novembre-2026.png",
      imageAlt: "Nouveaux horaires à partir du 26 novembre : de 9 h à 18 h du lundi au vendredi et de 9 h à 19 h le samedi et le dimanche",
      caption: "À partir du 26 novembre",
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

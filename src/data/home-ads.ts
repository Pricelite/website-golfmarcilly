/** Publicités de l'accueil. Les images doivent être placées dans public/. */
export type HomeAd = {
  advertiser: string;
  image: string;
  imageAlt: string;
  url: string;
  /** Dates inclusives au format AAAA-MM-JJ, dans le fuseau Europe/Paris. */
  startsOn?: string;
  endsOn?: string;
};

export const homeAds: { left: HomeAd | null; right: HomeAd | null } = {
  left: null,
  right: null,
};

export function visibleHomeAd(ad: HomeAd | null, today: string): HomeAd | null {
  if (!ad || (ad.startsOn && today < ad.startsOn) || (ad.endsOn && today > ad.endsOn)) return null;
  return ad;
}

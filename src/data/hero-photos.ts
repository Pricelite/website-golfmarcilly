import { golfPhotos } from "./golf-photos";

export const heroPhotos = [
  { src: "/images/parcours-accueil.webp", alt: "Les greens bordés d’arbres et d’un plan d’eau" },
  { src: "/images/accueil-trou-6.webp", alt: "Le green et le drapeau du trou 6 du Grand Parcours" },
  { src: "/images/accueil-pitch-putt.webp", alt: "Un green du Kaleka course aller vu entre les branches de pin" },
  { src: golfPhotos[0].src, alt: golfPhotos[0].alt },
  { src: golfPhotos[4].src, alt: golfPhotos[4].alt },
] as const;

const currentGolfOpeningSchedule = [
  { days: "Lundi au vendredi", hours: "de 8 h 30 à 19 h" },
  { days: "Samedi et dimanche", hours: "de 8 h à 20 h" },
] as const;
const winterGolfOpeningSchedule = [
  { days: "Lundi au vendredi", hours: "de 9 h à 18 h" },
  { days: "Samedi et dimanche", hours: "de 9 h à 19 h" },
] as const;

/** Horaires d'hiver du 1er novembre au 10 mars inclus, chaque année, heure de Paris. */
export function getGolfOpeningSchedule(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const month = parts.find(part => part.type === "month")?.value;
  const day = parts.find(part => part.type === "day")?.value;
  const monthDay = `${month}-${day}`;
  return monthDay >= "11-01" || monthDay <= "03-10" ? winterGolfOpeningSchedule : currentGolfOpeningSchedule;
}

export function getGolfOpeningHours(now = new Date()) {
  return getGolfOpeningSchedule(now).map(slot => `${slot.days} ${slot.hours}`).join(". ");
}

export const siteConfig = {
  name: "Golf de Marcilly",
  legalName: "Golf de Marcilly-Orléans",
  url: "https://www.golfdemarcilly.com",
  description:
    "Golf de Marcilly près d’Orléans : 45 trous, practice, initiations, cours, restaurant La Bergerie et événements à Marcilly-en-Villette.",
  phoneDisplay: "02 38 76 11 73",
  phoneHref: "+33238761173",
  email: "golf@marcilly.com",
  addressLine1: "829 domaine de la Plaine",
  addressLine2: "45240 Marcilly-en-Villette",
  region: "Loiret",
  city: "Marcilly-en-Villette",
  country: "France",
  countryCode: "FR",
  postalCode: "45240",
  alternateReservationUrl: "https://marcilly.reservations-golf.fr/",
  bookingEngineUrl: "https://golf-marcilly.book.teeitup.com/",
  flashGolfUrl: "https://www.flashgolf.app/",
  mapImageUrl:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=2.005,47.777,2.031,47.787&bboxSR=4326&imageSR=4326&size=1280,840&format=jpg&f=image",
  mapExternalUrl: "https://www.openstreetmap.org/way/65541772",
  socialLinks: [
    { label: "Facebook", href: "https://www.facebook.com/golfdemarcilly/" },
    { label: "Instagram", href: "https://www.instagram.com/golf_marcilly/" },
    { label: "LinkedIn", href: "https://fr.linkedin.com/company/golf-de-marcilly" },
  ],
  hours: [
    { label: "Restaurant", value: "Le lundi et du mercredi au vendredi : 12 h – 14 h. Samedi et dimanche : 12 h – 15 h. Fermé le mardi." },
    { label: "Practice", value: "Tous les jours, de 7 h 30 à 20 h" },
  ],
} as const;

export const navigationItems = [
  { label: "Accueil", href: "/" },
  { label: "Golf / Parcours", href: "/golf" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Enseignement", href: "/enseignement" },
  { label: "Je débute le golf", href: "/je-debute-le-golf" },
  { label: "Restaurant", href: "/restaurant" },
  { label: "Événements", href: "/evenements" },
  { label: "Association sportive", href: "/association-sportive" },
  { label: "Partenaires", href: "/partenaires" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNavigation = {
  visiter: [...navigationItems],
  infos: [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
  ],
} as const;

export const globalTestimonials = [
  {
    name: "Sophie R.",
    role: "Green fee weekend",
    quote:
      "Le site, le parcours et l’accueil donnent exactement la sensation d’un club premium sans prétention. Une vraie respiration à quelques minutes d’Orléans.",
  },
  {
    name: "Nicolas T.",
    role: "Séminaire entreprise",
    quote:
      "Organisation fluide, restauration qualitative et activités golf parfaitement adaptées à notre équipe. Nous avons gagné en image et en cohésion.",
  },
  {
    name: "Claire M.",
    role: "Cours débutante",
    quote:
      "Les pros mettent tout de suite en confiance. Le cadre est superbe et le parcours d’apprentissage est très bien pensé pour progresser vite.",
  },
] as const;

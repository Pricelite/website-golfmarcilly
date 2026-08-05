export const siteConfig = {
  name: "Golf de Marcilly",
  legalName: "Golf de Marcilly-Orléans",
  url: "https://www.marcilly.com",
  description:
    "Golf de Marcilly : 45 trous d'exception, restaurant La Bergerie, enseignement et événements premium aux portes d'Orléans.",
  phoneDisplay: "02 38 76 11 73",
  phoneHref: "+33238761173",
  email: "golf@marcilly.com",
  addressLine1: "829 domaine de la Plaine",
  addressLine2: "45240 Marcilly-en-Villette",
  region: "Loiret",
  city: "Marcilly-en-Villette",
  country: "France",
  reservationUrl: "https://marcilly.reservations-golf.fr/",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Golf%20de%20Marcilly&z=13&output=embed",
  socialLinks: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
  ],
  hours: [
    { label: "Accueil", value: "Tous les jours, 8h00 - 19h00" },
    { label: "Restaurant", value: "Mercredi au dimanche, 12h00 - 15h00" },
    { label: "Practice", value: "Tous les jours, 7h30 - 20h00" },
  ],
} as const;

export const navigationItems = [
  { label: "Accueil", href: "/" },
  { label: "Golf / Parcours", href: "/golf" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Enseignement", href: "/enseignement" },
  { label: "Restaurant", href: "/restaurant" },
  { label: "Événements", href: "/evenements" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerNavigation = {
  visiter: navigationItems,
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
      "Le site, le parcours et l'accueil donnent exactement la sensation d'un club premium sans prétention. Une vraie respiration à quelques minutes d'Orléans.",
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
      "Les pros mettent tout de suite en confiance. Le cadre est superbe et le parcours d'apprentissage est très bien pensé pour progresser vite.",
  },
] as const;

export const homeHighlights = [
  {
    eyebrow: "Cadre d'exception",
    title: "Un domaine golfique complet dans un ecrin naturel",
    description:
      "Entre forets, plans d'eau et larges fairways, Marcilly propose une experience golf et art de vivre rare dans le Loiret.",
  },
  {
    eyebrow: "Accessibilite",
    title: "Une destination premium a moins de 25 minutes d'Orleans",
    description:
      "Ideal pour un green fee, un dejeuner au restaurant, un cours de golf ou un seminaire d'entreprise sans logistique complexe.",
  },
  {
    eyebrow: "Polyvalence",
    title: "Golf, restauration, enseignement et evenements sur un meme site",
    description:
      "Le domaine reunit les conditions ideales pour accueillir joueurs reguliers, debutants, familles, groupes et entreprises.",
  },
] as const;

export const homeOffers = [
  {
    eyebrow: "Affiche 01",
    title: "Offre decouverte",
    description:
      "Affiche active sur l'accueil pour votre offre decouverte.",
    ctaLabel: "Voir l'offre",
    ctaHref: "/golf",
    accentClassName: "from-amber-200/80 via-stone-50 to-white",
    imageSrc: "/offre dec.png",
  },
  {
    eyebrow: "Affiche 02",
    title: "Offre green fee",
    description:
      "Affiche active sur l'accueil pour votre offre green fee competition.",
    ctaLabel: "Voir l'offre",
    ctaHref: "https://prima.golf/marcilly/login",
    accentClassName: "from-emerald-200/80 via-white to-emerald-50",
    imageSrc: "/offre gf.png",
  },
  {
    eyebrow: "Affiche 03",
    title: "Votre troisieme affiche",
    description:
      "Emplacement reserve pour mettre en avant une offre forte, une nouveaute saisonniere ou une operation commerciale.",
    ctaLabel: "Ajouter une offre",
    ctaHref: "https://prima.golf/marcilly/login",
    accentClassName: "from-sky-200/70 via-white to-stone-50",
    imageSrc: null,
  },
] as const;

export const homeReasons = [
  {
    title: "45 trous pour tous les niveaux",
    description:
      "Grand parcours, 9 trous, pitch & putt et practice pour varier les plaisirs et jouer toute l'annee.",
  },
  {
    title: "Restaurant La Bergerie",
    description:
      "Une adresse chaleureuse, credible pour vos rendez-vous, dejeuners golfeurs et receptions privees.",
  },
  {
    title: "Academie et coaching",
    description:
      "Parcours d'apprentissage clairs pour debutants, joueurs loisirs et competiteurs cherchant un accompagnement sur mesure.",
  },
  {
    title: "Seminaires a forte valeur percue",
    description:
      "Espaces, restauration et activites team building reunis dans une meme experience haut de gamme.",
  },
] as const;

export const homeFaqs = [
  {
    question: "Le Golf de Marcilly convient-il aux debutants ?",
    answer:
      "Oui. L'offre combine practice, pitch & putt, parcours d'initiation et accompagnement par des enseignants pour demarrer dans de tres bonnes conditions.",
  },
  {
    question: "Peut-on venir uniquement pour dejeuner au restaurant ?",
    answer:
      "Absolument. Le restaurant La Bergerie accueille aussi bien les golfeurs que les visiteurs exterieurs, sur reservation conseillee.",
  },
  {
    question: "Proposez-vous des seminaires pres d'Orleans ?",
    answer:
      "Oui. Nous accueillons reunions, incentives, team buildings, dejeuners d'affaires et evenements prives avec des formules adaptables.",
  },
  {
    question: "Comment reserver un depart ou un cours ?",
    answer:
      "Le bouton de reservation present dans le header et en bas des sections mene a la prise de contact ou a la reservation. Vous pouvez aussi nous appeler directement.",
  },
] as const;

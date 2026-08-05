export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  coverImage: string;
  readingTime: string;
  seoDescription: string;
  content: string[];
};

export const posts: Post[] = [
  {
    slug: "ouvrir-la-saison-de-golf-pres-orleans",
    title: "Ouvrir la saison de golf près d'Orléans dans les meilleures conditions",
    excerpt:
      "Nos conseils pour reprendre le jeu, régler son entraînement et profiter d'un green fee à Marcilly dès les premiers beaux jours.",
    publishedAt: "2026-03-18",
    category: "Conseils",
    coverImage: "/images/grandparcours.png",
    readingTime: "4 min",
    seoDescription:
      "Conseils pour bien débuter la saison au Golf de Marcilly, golf près d'Orléans dans le Loiret.",
    content: [
      "La reprise de saison demande de retrouver des repères simples : rythme, contact de balle, confiance au petit jeu et choix de parcours adaptés.",
      "À Marcilly, la complémentarité entre practice, pitch & putt et grands parcours permet de remettre progressivement le corps et la technique en route.",
      "C'est aussi le bon moment pour réserver un cours, faire un point sur son matériel et relancer une routine de jeu durable.",
    ],
  },
  {
    slug: "seminaire-golf-orleans-5-raisons",
    title: "5 raisons d'organiser un séminaire golf dans le Loiret",
    excerpt:
      "Un domaine golfique premium peut transformer une journée d'entreprise en véritable levier d'image, d'engagement et de mémorisation.",
    publishedAt: "2026-02-06",
    category: "Entreprise",
    coverImage: "/images/clubhouse.png",
    readingTime: "5 min",
    seoDescription:
      "Pourquoi choisir un séminaire golf près d'Orléans pour vos équipes et vos clients.",
    content: [
      "Le cadre naturel change immédiatement la perception de l'événement et crée un niveau de standing difficile à reproduire en centre-ville.",
      "Les formats team building golf sont inclusifs, mémorables et adaptables à tous les niveaux, même sans pratique préalable.",
      "La combinaison réunions, restauration et activités sur un seul site fluidifie toute l'organisation et améliore l'expérience invité.",
    ],
  },
  {
    slug: "restaurant-golf-orleans-dejeuner-affaires",
    title: "Pourquoi choisir un restaurant de golf pour un déjeuner d'affaires",
    excerpt:
      "Entre discrétion, nature et qualité perçue, La Bergerie offre un cadre idéal pour recevoir clients et partenaires.",
    publishedAt: "2026-01-22",
    category: "Restaurant",
    coverImage: "/restaurant/hero.jpg",
    readingTime: "3 min",
    seoDescription:
      "Restaurant golf Orléans : un lieu crédible pour vos déjeuners d'affaires dans le Loiret.",
    content: [
      "Un restaurant de golf apporte une sensation immédiate d'espace, de calme et de distinction sans tomber dans le formalisme.",
      "La Bergerie permet de prolonger un rendez-vous professionnel autour d'une table élégante, avec un service adapté aux contraintes de temps.",
      "C'est aussi une excellente porte d'entrée pour faire découvrir le domaine à des prospects ou à des partenaires stratégiques.",
    ],
  },
];

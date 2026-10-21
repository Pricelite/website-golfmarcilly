import { readingTime } from "@/lib/reading-time";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: string;
  coverImage: string;
  coverImageAlt?: string;
  readingTime: string;
  seoDescription: string;
  content: string[];
};

const articleContent: Omit<Post, "readingTime">[] = [
  {
    slug: "ouvrir-la-saison-de-golf-pres-orleans",
    title: "Ouvrir la saison de golf près d'Orléans dans les meilleures conditions",
    excerpt:
      "Nos conseils pour reprendre le jeu, régler son entraînement et profiter d'un green fee à Marcilly dès les premiers beaux jours.",
    publishedAt: "2026-03-18",
    category: "Conseils",
    // Photo d'illustration : Toa Heftiba, Unsplash (https://unsplash.com/photos/Wi7sPskmZhE).
    coverImage: "/images/article-saison-golf-toa-heftiba.jpg",
    coverImageAlt: "Parcours de golf arboré au printemps, photo d'illustration",
    seoDescription:
      "Conseils pour bien débuter la saison au Golf de Marcilly, golf près d'Orléans dans le Loiret.",
    content: [
      "La reprise de saison demande de retrouver des repères simples : rythme, contact de balle, confiance au petit jeu et choix de parcours adaptés.",
      "À Marcilly, la complémentarité entre practice, Kaleka course aller et grands parcours permet de remettre progressivement le corps et la technique en route.",
      "C'est aussi le bon moment pour réserver un cours, faire un point sur son matériel et relancer une routine de jeu durable.",
    ],
  },
  {
    slug: "seminaire-golf-orleans-5-raisons",
    title: "5 raisons d'organiser un séminaire golf dans le Loiret",
    excerpt:
      "Une salle équipée, une initiation accessible aux débutants et un repas sur place : cinq points pour préparer votre journée d’équipe à Marcilly.",
    publishedAt: "2026-02-06",
    category: "Entreprise",
    coverImage: "/images/bar-la-bergerie-seminaire.jpeg",
    seoDescription:
      "Pourquoi choisir un séminaire golf près d'Orléans pour vos équipes et vos clients.",
    content: [
      "1. Se retrouver au vert près d’Orléans. À Marcilly-en-Villette, le domaine permet d’alterner une réunion et un temps dehors. Précisez votre programme à l’équipe pour organiser les différents moments de la journée.",
      "2. Réunir son équipe dans une salle équipée. La formule séminaire prévoit une salle pouvant accueillir jusqu’à 90 personnes, un vidéoprojecteur, un paperboard et le wifi. L’équipe vous conseille sur la disposition adaptée à votre groupe.",
      "3. Découvrir une activité ensemble. Une initiation permet aux participants qui n’ont jamais joué d’essayer le golf avec un encadrement. D’autres formats, dont le footgolf, peuvent être étudiés avec l’équipe.",
      "4. Déjeuner sur place à La Bergerie. La restauration peut s’intégrer à votre programme. Le menu est à définir selon la saison et les besoins de votre groupe.",
      "5. Préparer une proposition adaptée. Indiquez la date souhaitée, le nombre de participants, les temps de réunion et les activités envisagées. L’équipe précisera les disponibilités et les prestations dans votre devis.",
    ],
  },
  {
    slug: "restaurant-golf-orleans-dejeuner-affaires",
    title: "Pourquoi choisir un restaurant de golf pour un déjeuner d'affaires",
    excerpt:
      "Ouverte aussi aux visiteurs qui ne jouent pas au golf, La Bergerie accueille vos déjeuners et étudie vos demandes de repas de groupe.",
    publishedAt: "2026-01-22",
    category: "Restaurant",
    coverImage: "/restaurant/hero.jpg",
    seoDescription:
      "Préparez votre déjeuner à La Bergerie, restaurant du Golf de Marcilly près d’Orléans : horaires, carte et demandes de groupe.",
    content: [
      "Vous pouvez venir déjeuner à La Bergerie sans jouer au golf. Le restaurant se situe sur le domaine de Marcilly, à Marcilly-en-Villette, dans le Loiret.",
      "Avant votre visite, consultez les horaires et la carte de La Bergerie, valable jusqu’à sa prochaine mise à jour, sous réserve de disponibilité des plats. Pour toute question, contactez le restaurant.",
      "Pour un déjeuner d’équipe ou un repas de groupe, précisez la date, le nombre de convives et vos besoins dans la demande de devis. Une demande de table reste soumise à la confirmation du restaurant.",
    ],
  },
];

export const posts: Post[] = articleContent.map(post => ({ ...post, readingTime: readingTime(post.title, post.excerpt, post.content) })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const eventFormats = [
  {
    eyebrow: "01 / Se réunir",
    title: "Séminaires & réunions",
    description:
      "Changez de décor pour votre journée d’étude, votre comité de direction ou votre rendez-vous clients. Un temps de travail qui laisse aussi la place aux échanges.",
    image: "/images/seminaire-conference-marcilly.png",
    imageAlt: "Illustration d’un séminaire réunissant des participants autour d’une conférence",
  },
  {
    eyebrow: "02 / Partager",
    title: "Team building & golf",
    description:
      "Offrez à votre équipe une expérience à vivre ensemble : initiation au golf, challenge ou footgolf, selon les envies et le niveau de chacun.",
    image: "/images/initiation-groupe-professeur.png",
    imageAlt: "Illustration d’une initiation au golf en groupe",
  },
  {
    eyebrow: "03 / Prolonger",
    title: "Déjeuners & réceptions",
    description:
      "Retrouvez vos collaborateurs ou vos clients autour d’un repas à La Bergerie. Étudions ensemble le format de votre réception ou de votre soirée.",
    image: "/images/bar-la-bergerie-seminaire.jpeg",
    imageAlt: "Le bar du restaurant La Bergerie au Golf de Marcilly",
  },
] as const;

export const eventIdeas = [
  {
    title: "Réunion au vert & initiation",
    audience: "Pour une équipe qui souhaite travailler et découvrir le golf ensemble",
    steps: [
      "Un temps de réunion ou de présentation pour poser les sujets du jour.",
      "Un déjeuner à La Bergerie pour poursuivre les échanges.",
      "Une initiation au golf en groupe, adaptée aux personnes qui débutent.",
    ],
  },
  {
    title: "Challenge d’équipe autour du golf",
    audience: "Pour réunir des collègues autour d’une activité commune",
    steps: [
      "Un accueil et une découverte des gestes de base.",
      "Des ateliers ou un challenge par équipes à construire selon le niveau du groupe.",
      "Un repas ou un moment convivial à La Bergerie pour terminer la rencontre.",
    ],
  },
  {
    title: "Rencontre clients & découverte",
    audience: "Pour recevoir des partenaires dans un cadre différent",
    steps: [
      "Une présentation ou un échange professionnel au club.",
      "Une activité d’initiation accessible aux invités qui ne jouent pas au golf.",
      "Un déjeuner de groupe pour prolonger les conversations.",
    ],
  },
  {
    title: "Journée conviviale avec footgolf",
    audience: "Pour partager un moment sportif sans pratique préalable du golf",
    steps: [
      "Un accueil des participants et une présentation de l’activité.",
      "Une partie de footgolf ou un défi collectif à organiser avec l’équipe du golf.",
      "Un repas de groupe à La Bergerie selon votre projet.",
    ],
  },
] as const;

export const restaurantHighlights = [
  {
    title: "Déjeunez au golf, même sans jouer",
    description:
      "La Bergerie accueille les golfeurs et les visiteurs extérieurs pour un déjeuner ou un rendez-vous d'affaires.",
  },
  {
    title: "Des menus pour votre repas ou votre groupe",
    description:
      "Consultez les formules de déjeuner, de séminaire et de réception, puis contactez l'équipe pour votre repas de groupe ou votre privatisation.",
  },
] as const;

export const restaurantFaqs = [
  {
    question: "Le restaurant est-il accessible sans jouer au golf ?",
    answer:
      "Oui. La Bergerie accueille les golfeurs comme les visiteurs extérieurs, sur réservation conseillée selon l'affluence.",
  },
  {
    question: "Peut-on privatiser le restaurant ?",
    answer:
      "Oui. Nous proposons des formats déjeuner, cocktail, dîner assis ou réception privative pour groupes et entreprises.",
  },
  {
    question: "Proposez-vous des menus groupes ou séminaire ?",
    answer:
      "Oui. Des menus dédiés peuvent être construits selon le nombre d'invités, le timing et le niveau de prestation attendu.",
  },
] as const;

export const restaurantMenus = [
  {
    title: "Déjeuner golf & terroir",
    items: ["Entrée du marché", "Pièce de poisson ou viande rôtie", "Dessert du chef"],
    price: "À partir de 34 €",
  },
  {
    title: "Menu séminaire",
    items: ["Entrée à partager", "Plat de saison", "Café gourmand"],
    price: "À partir de 42 €",
  },
  {
    title: "Cocktail réception",
    items: ["12 pièces salées", "4 pièces sucrées", "Boissons soft incluses"],
    price: "À partir de 29 €",
  },
] as const;

export const restaurantGallery = [
  {
    src: "/restaurant/hero.jpg",
    alt: "Salle du restaurant La Bergerie",
    title: "La salle du restaurant",
    description: "Un cadre lumineux et chaleureux pour déjeuner ou recevoir.",
  },
  {
    src: "/restaurant/chef-1.jpg",
    alt: "Le chef de La Bergerie en cuisine",
    title: "Le chef en cuisine",
    description: "Une cuisine de domaine soignée, sincère et généreuse.",
  },
  {
    src: "/images/cuisine.png",
    alt: "Assiette du restaurant La Bergerie",
    title: "Une assiette signature",
    description: "Des plats élégants pensés pour la table, les groupes et les événements.",
  },
] as const;

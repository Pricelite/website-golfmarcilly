export const restaurantHighlights = [
  {
    title: "Une table de domaine chaleureuse",
    description:
      "La Bergerie signe une experience culinaire sincere, vegetale et conviviale, parfaite apres une partie comme pour un rendez-vous d'affaires.",
  },
  {
    title: "Menus lisibles et saisonniers",
    description:
      "La carte evolue selon les produits et les moments de vie du club, avec une offre adaptee au dejeuner, aux groupes et aux privatisations.",
  },
];

export const restaurantFaqs = [
  {
    question: "Le restaurant est-il accessible sans jouer au golf ?",
    answer:
      "Oui. La Bergerie accueille les golfeurs comme les visiteurs exterieurs, sur reservation conseillee selon l'affluence.",
  },
  {
    question: "Peut-on privatiser le restaurant ?",
    answer:
      "Oui. Nous proposons des formats dejeuner, cocktail, diner assis ou reception privative pour groupes et entreprises.",
  },
  {
    question: "Proposez-vous des menus groupes ou seminaire ?",
    answer:
      "Oui. Des menus dedies peuvent etre construits selon le nombre d'invites, le timing et le niveau de prestation attendu.",
  },
] as const;

export const restaurantMenus = [
  {
    title: "Dejeuner golf & terroir",
    items: ["Entree du marche", "Piece de poisson ou viande rotie", "Dessert du chef"],
    price: "A partir de 34 EUR",
  },
  {
    title: "Menu seminaire",
    items: ["Entree a partager", "Plat de saison", "Cafe gourmand"],
    price: "A partir de 42 EUR",
  },
  {
    title: "Cocktail reception",
    items: ["12 pieces salees", "4 pieces sucrees", "Boissons soft incluses"],
    price: "A partir de 29 EUR",
  },
] as const;

export const restaurantGallery = [
  { src: "/restaurant/hero.jpg", alt: "Salle du restaurant La Bergerie" },
  { src: "/restaurant/chef-1.jpg", alt: "Le chef de La Bergerie en cuisine" },
  { src: "/images/cuisine.png", alt: "Assiette du restaurant La Bergerie" },
];

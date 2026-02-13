export type RestaurantService = {
  title: string;
  description?: string;
};

export type RestaurantHours = {
  label: string;
  hours: string;
};

export type RestaurantMenuItem = {
  name: string;
  price: string;
};

export type RestaurantMenuSection = {
  title: string;
  items: RestaurantMenuItem[];
  note?: string;
};

export type GroupMenuSection = {
  title: string;
  type: "choice" | "list";
  items: string[];
};

export type GroupMenu = {
  name: string;
  price: string;
  sections: GroupMenuSection[];
};

export type SeminarMenuSection = {
  title: string;
  items: string[];
};

export type RestaurantCgvSection = {
  title: string;
  items: string[];
};

export type RestaurantData = {
  title: string;
  name: string;
  intro: {
    paragraphs: string[];
    roomRental: string;
    roomRentalNote: string;
  };
  services: RestaurantService[];
  hours: RestaurantHours[];
  carte: {
    title: string;
    sections: RestaurantMenuSection[];
  };
  groupMenus: {
    title: string;
    ctaLabel: string;
    items: GroupMenu[];
  };
  seminarMenu: {
    title: string;
    price: string;
    sections: SeminarMenuSection[];
  };
  cgv: {
    title: string;
    sections: RestaurantCgvSection[];
    closingNote: string;
  };
};

export const restaurantData: RestaurantData = {
  title: "Restaurant",
  name: "La Bergerie",
  intro: {
    paragraphs: [
      "Le restaurant La Bergerie vous propose de nombreuses possibilités pour votre réception, que ce soit à titre professionnel ou personnel.",
      "N'hésitez pas à nous contacter pour nous faire part de vos envies et nous vous retournerons un devis sur-mesure.",
    ],
    roomRental: "Possibilité de louer la salle sans nos services de restauration : 700 €",
    roomRentalNote: "Vaisselle et nappage en supplément.",
  },
  services: [
    {
      title: "Au Quotidien",
      description:
        "Du lundi au dimanche midi, le restaurant La Bergerie vous accueille avec une cuisine simple et gourmande.",
    },
    {
      title: "Réservations pour Séminaires et Groupes",
      description:
        "Salle équipée pour recevoir vos réunions et groupes de travail dans un cadre bucolique.",
    },
    {
      title: "Restaurant ouvert à tous",
    },
  ],
  hours: [
    { label: "Lundi au vendredi", hours: "12h00 à 14h00" },
    { label: "Samedi et dimanche", hours: "12h00 à 15h00" },
  ],
  carte: {
    title: "La Carte du Moment",
    sections: [
      {
        title: "Entrées",
        items: [
          { name: "Poireaux revisités à la vinaigrette", price: "9 €" },
          { name: "Œuf cocotte", price: "10 €" },
          { name: "Saumon gravlax", price: "10 €" },
          { name: "Carpaccio de Saint-Jacques", price: "11 €" },
        ],
      },
      {
        title: "Plats",
        items: [
          { name: "Araignée de porc en persillade", price: "17 €" },
          { name: "Burger de la Bergerie", price: "17 €" },
          { name: "Sauté de sanglier à la vigneronne", price: "18 €" },
          {
            name: "Picahna de veau grillée, sauce chimichurri",
            price: "19 €",
          },
          { name: "Parmentier de canard sauce foie gras", price: "20 €" },
          { name: "Pièce du boucher", price: "23 €" },
          { name: "Côte façon plancha", price: "24 €" },
        ],
      },
      {
        title: "Desserts",
        items: [
          { name: "Cookie crème choco–caramel", price: "9,50 €" },
          { name: "Cheesecake fruits rouges, pistaches", price: "9,50 €" },
          {
            name: "Nuage de riz au lait caramélisé, croustillant de noisette",
            price: "9,50 €",
          },
          { name: "Assiette de fromages", price: "9,50 €" },
          { name: "Café / Thé gourmand", price: "9,50 €" },
          { name: "Coupe Colonel", price: "7,50 €" },
          { name: "Coupe 1 boule", price: "3 €" },
          { name: "Coupe 2 boules", price: "4,50 €" },
          { name: "Coupe 3 boules", price: "6 €" },
        ],
        note:
          "Parfums : vanille, citron, fraise, chocolat croquant, pistache, menthe chocolat",
      },
    ],
  },
  groupMenus: {
    title: "Nos Menus de Groupes",
    ctaLabel: "Je demande un devis",
    items: [
      {
        name: "Menu Tentation",
        price: "25 €",
        sections: [
          {
            title: "Entrées",
            type: "choice",
            items: [
              "Saucisson brioché, servi avec une sauce marchand de vin",
              "Feuilleté de fruits de mer, émulsion safranée",
            ],
          },
          {
            title: "Plats",
            type: "choice",
            items: [
              "Suprême de volaille, sauce suprême, accompagné d’un gratin dauphinois",
              "Dos de lieu noir, sauce beurre blanc, accompagné de riz blanc et de légumes du moment",
            ],
          },
          {
            title: "Desserts",
            type: "choice",
            items: [
              "Tarte fine aux pommes, glace vanille",
              "Île flottante, sauce caramel",
            ],
          },
        ],
      },
      {
        name: "Menu Gourmand",
        price: "30 €",
        sections: [
          {
            title: "Entrées",
            type: "choice",
            items: [
              "Tartare de deux saumons aux agrumes",
              "Salade du Périgord (magret fumé, gésiers confits, pommes de terre, salade verte)",
            ],
          },
          {
            title: "Plats",
            type: "choice",
            items: [
              "Dos de cabillaud, sauce satay (Purée de pommes de terre & légumes du moment)",
              "Médaillon de filet mignon, sauce marsala (Pommes de terre au four & flan de carottes)",
            ],
          },
          {
            title: "Desserts",
            type: "choice",
            items: [
              "Maxi profiterole au chocolat & amandes grillées",
              "Carpaccio d’ananas flambé, sorbet coco",
            ],
          },
          {
            title: "Boissons comprises",
            type: "list",
            items: ["1 verre de vin blanc ou rouge", "1 café"],
          },
        ],
      },
      {
        name: "Menu Élégance",
        price: "35 €",
        sections: [
          {
            title: "Entrées",
            type: "choice",
            items: [
              "Terrine de foie gras de canard, confiture d’oignons et brioche parisienne",
              "Carpaccio de Saint-Jacques, lait de coco & agrumes",
            ],
          },
          {
            title: "Plats",
            type: "choice",
            items: [
              "Pavé de filet de bœuf, sauce aux morilles (pommes paillasson & poêlée de champignons)",
              "Risotto de Saint-Jacques au chorizo (pointes d’asperges vertes)",
            ],
          },
          {
            title: "Desserts",
            type: "choice",
            items: [
              "Tarte citron / citron vert revisitée, meringue croustillante",
              "Royal chocolat et croquant feuilleté",
            ],
          },
          {
            title: "Boissons comprises",
            type: "list",
            items: ["1 verre de vin blanc ou rouge", "1 café"],
          },
        ],
      },
    ],
  },
  seminarMenu: {
    title: "Menu Séminaire",
    price: "60 €/pers.",
    sections: [
      {
        title: "Café d'accueil",
        items: ["Café, thé, jus de fruits, viennoiseries"],
      },
      {
        title: "Location de salle",
        items: ["Salle de réunion", "Vidéoprojecteur", "Paperboard", "Wifi"],
      },
      {
        title: "Repas (à définir selon la saison)",
        items: [],
      },
      {
        title: "Exemple : Entrée",
        items: ["Cassolette de la mer safranée"],
      },
      {
        title: "Exemple : Plat",
        items: [
          "Cuisse de canard confite sauce poivre, purée de panais et flan de champignons",
        ],
      },
      {
        title: "Exemple : Dessert",
        items: ["Tarte Tatin revisitée en verrine et crémeux vanille"],
      },
      {
        title: "Exemple : Boissons",
        items: ["Café et 1/4 de vin de notre sélection"],
      },
    ],
  },
  cgv: {
    title: "Nos Conditions Générales de Vente",
    sections: [
      {
        title: "Conditions de réservation",
        items: [
          "Le nombre total de convives facturé pour les repas sera le nombre donné 10 jours avant la date de votre événement.",
          "Le choix d'un menu unique est souhaité pour une meilleure réalisation de votre prestation.",
        ],
      },
      {
        title: "Détails techniques",
        items: [
          "Remise des clés le jour même.",
          "Décoration de la salle par vos soins (murale, centre de table,...)",
          "Nappes et serviettes blanches fournies sauf en cas de réservation de salle seule.",
          "Tables rondes de 6/7 personnes.",
        ],
      },
      {
        title: "Informations diverses",
        items: [
          "Horaire maximum d'animation : 06 heures du matin.",
          "Possibilité d'apporter votre vin pour le repas avec un droit de bouchon de 5 € par bouteille ouverte.",
        ],
      },
    ],
    closingNote:
      "Toute l'équipe de la Bergerie est à votre service pour la réussite de votre soirée",
  },
};

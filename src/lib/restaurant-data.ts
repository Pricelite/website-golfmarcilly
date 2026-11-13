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
  description?: string;
  note?: string;
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
      "Repas de groupe, réunion ou réception : indiquez la date, le nombre de convives et les prestations souhaitées pour recevoir un devis.",
    ],
    roomRental: "Possibilité de louer la salle sans nos services de restauration : 700 €",
    roomRentalNote: "Vaisselle et nappage en supplément.",
  },
  services: [
    {
      title: "Au quotidien",
      description:
        "Le lundi et du mercredi au dimanche midi, le restaurant La Bergerie vous accueille avec une cuisine simple et gourmande.",
    },
    {
      title: "Séminaires et groupes",
      description:
        "Salle équipée pour recevoir vos réunions et groupes de travail dans un cadre bucolique.",
    },
    {
      title: "Restaurant ouvert à tous",
    },
  ],
  hours: [
    { label: "Lundi", hours: "12h00 - 14h30" },
    { label: "Mardi", hours: "Fermé" },
    { label: "Mercredi", hours: "12h00 - 14h30" },
    { label: "Jeudi", hours: "12h00 - 14h30" },
    { label: "Vendredi", hours: "12h00 - 14h30" },
    { label: "Samedi", hours: "12h00 - 15h00" },
    { label: "Dimanche", hours: "12h00 - 15h00" },
  ],
  carte: {
    title: "La carte du moment",
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
            name: "Picanha de veau grillée, sauce chimichurri",
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
    title: "Nos menus de groupes",
    ctaLabel: "Je demande un devis",
    items: [
      {
        name: "Menu La Bergerie",
        price: "24,90 €",
        description: "Entrée et plat ou plat et dessert.",
        sections: [],
      },
      {
        name: "Menu Tentation",
        price: "29,90 €",
        sections: [
          {
            title: "Entrées",
            type: "choice",
            items: [
              "Saucisson brioché, sauce marchand de vin",
              "Feuilleté de fruits de mer, émulsion safranée",
            ],
          },
          {
            title: "Plats",
            type: "choice",
            items: [
              "Suprême de volaille, gratin dauphinois",
              "Dos de lieu noir, beurre blanc, riz et légumes",
            ],
          },
          {
            title: "Desserts",
            type: "choice",
            items: [
              "Tarte fine aux pommes",
              "Île flottante",
            ],
          },
        ],
      },
      {
        name: "Menu Gourmand",
        price: "32,90 €",
        sections: [
          {
            title: "Entrées",
            type: "choice",
            items: [
              "Tartare de deux saumons aux agrumes",
              "Salade du Périgord",
            ],
          },
          {
            title: "Plats",
            type: "choice",
            items: [
              "Dos de cabillaud, sauce satay",
              "Médaillon de filet mignon, sauce marsala",
            ],
          },
          {
            title: "Desserts",
            type: "choice",
            items: [
              "Maxi profiterole au chocolat",
              "Carpaccio d’ananas flambé, sorbet coco",
            ],
          },
        ],
      },
      {
        name: "Menu Élégance",
        price: "44,90 €",
        note: "Café compris.",
        sections: [
          {
            title: "Entrées",
            type: "choice",
            items: [
              "Terrine de foie gras de canard",
              "Saumon gravlax",
            ],
          },
          {
            title: "Plats",
            type: "choice",
            items: [
              "Pavé de filet de bœuf, sauce aux morilles",
              "Risotto de Saint-Jacques au chorizo et asperges",
            ],
          },
          {
            title: "Desserts",
            type: "choice",
            items: [
              "Tarte citron et citron vert revisitée",
              "Royal chocolat",
            ],
          },
        ],
      },
      {
        name: "Menu Brasero",
        price: "32,90 €",
        note: "Café compris. Côte de bœuf et magret de canard sur devis.",
        sections: [
          { title: "Grillades", type: "list", items: ["Chipolatas", "Merguez", "Travers de porc marinés", "Hampe de bœuf"] },
          { title: "Accompagnements", type: "list", items: ["Pommes de terre grenailles", "Piémontaise", "Salade de riz niçoise", "Salade de pâtes au pesto"] },
          { title: "Desserts (buffet)", type: "list", items: ["Tarte aux pommes", "Riz au lait", "Panna cotta", "Brownie"] },
        ],
      },
    ],
  },
  seminarMenu: {
    title: "Menu séminaire",
    price: "60 €/pers.",
    sections: [
      {
        title: "Café d’accueil",
        items: ["Café, thé, jus de fruits, viennoiseries"],
      },
      {
        title: "Location de salle",
        items: ["Salle de réunion", "Vidéoprojecteur", "Paperboard", "Wi-Fi"],
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
    title: "Nos conditions générales de vente",
    sections: [
      {
        title: "Conditions de réservation",
        items: [
          "Le nombre de convives facturé correspondra au nombre communiqué 10 jours avant votre événement.",
          "Le choix d’un menu unique est souhaité pour une meilleure réalisation de votre prestation.",
        ],
      },
      {
        title: "Détails techniques",
        items: [
          "Remise des clés le jour même.",
          "Décoration de la salle par vos soins (décoration murale, centres de table…).",
          "Nappes et serviettes blanches fournies, sauf en cas de réservation de la salle seule.",
          "Tables rondes de 6 à 7 personnes.",
        ],
      },
      {
        title: "Informations diverses",
        items: [
          "Heure limite des animations : 6 h du matin.",
          "Possibilité d’apporter votre vin ou votre champagne pour le repas avec un droit de bouchon de 5 € par bouteille de vin ouverte et de 8 € par bouteille de champagne ouverte.",
        ],
      },
    ],
    closingNote:
      "Toute l’équipe de La Bergerie est à votre service pour la réussite de votre soirée.",
  },
};

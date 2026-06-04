export type PricingRow = {
  label: string;
  values: [string, string];
  note?: string;
};

export type PricingSection = {
  title: string;
  description: string;
  columns: [string, string];
  rows: PricingRow[];
  footnotes?: string[];
};

export const pricingSections: PricingSection[] = [
  {
    title: "Découverte",
    description: "Tarifs 2026 officiels pour découvrir le golf à Marcilly.",
    columns: ["Formule", "Tarif"],
    rows: [
      {
        label: "Demi-journée découverte",
        values: ["Initiation encadrée + parcours 9 trous", "25 €"],
      },
      {
        label: "Journée découverte",
        values: ["Initiation encadrée + repas + parcours 9 trous", "48 €"],
      },
    ],
  },
  {
    title: "Practice",
    description: "Accès practice et cartes de seaux.",
    columns: ["Extérieurs", "Abonnés"],
    rows: [
      { label: "2 seaux de balles", values: ["6 €", "5 €"] },
      {
        label: "Seaux illimités 2 heures / personne",
        values: ["10 €", "10 €"],
      },
      { label: "Carte de 11 seaux", values: ["27 €", "23 €"] },
      { label: "Carte de 25 seaux", values: ["54 €", "50 €"] },
      { label: "Carte de 50 seaux", values: ["99 €", "95 €"] },
    ],
    footnotes: ["Prêt d'un club par seau et par personne."],
  },
  {
    title: "Green fees",
    description: "Tarifs 2026 officiels pour les parcours.",
    columns: ["Non licencié", "Licencié"],
    rows: [
      { label: "9 trous Découverte ou Footgolf", values: ["10 €", "10 €"] },
      {
        label: "18 trous Pitch & Putt ou Kaleka",
        values: ["25 € (1T)", "23 € (1T)"],
        note: "Jeunes -20 ans : 20 € / licencié 18 €",
      },
      {
        label: "9 trous Grand Parcours",
        values: ["44 € (4T)", "39 € (3T)"],
        note: "Jeunes -20 ans : 30 € / licencié 25 €",
      },
      {
        label: "18 trous Grand Parcours",
        values: ["64 € (6T)", "59 € (5T)"],
        note: "Jeunes -20 ans : 40 € / licencié 30 €",
      },
      {
        label: "18 trous après 16h00",
        values: ["44 € (4T)", "39 € (3T)"],
      },
      {
        label: "Carnet 10 tickets dématérialisés",
        values: ["Pitch & Kaleka", "200 €"],
      },
      {
        label: "Carnet 30 tickets dématérialisés",
        values: ["Grand Parcours", "300 €"],
      },
    ],
    footnotes: ["Carnets valables 6 mois."],
  },
  {
    title: "Location",
    description: "Matériel et équipements sur place.",
    columns: ["Extérieurs", "Abonnés"],
    rows: [
      { label: "Chariot", values: ["5 €", "5 €"] },
      { label: "Voiturette 9 trous", values: ["28 €", "24 €"] },
      { label: "Voiturette 18 trous", values: ["38 €", "32 €"] },
      { label: "Carnet de 11 voiturettes", values: ["380 €", "320 €"] },
      { label: "Casier à l'année", values: ["48 €", "48 €"] },
      {
        label: "Local chariot à l'année (manuel)",
        values: ["84 €", "84 €"],
      },
      {
        label: "Local chariot à l'année (électrique)",
        values: ["96 €", "96 €"],
      },
    ],
  },
  {
    title: "Abonnements Practice",
    description: "Droit practice aux tarifs abonnés.",
    columns: ["Profil", "Tarif"],
    rows: [
      { label: "25 ans et moins", values: ["Abonnement", "222 €"] },
      { label: "26 ans et plus", values: ["Abonnement", "270 €"] },
      { label: "Couple 26 ans et plus", values: ["Abonnement", "420 €"] },
    ],
  },
  {
    title: "27 trous temps plein 7j/7",
    description: "Abonnements 2026 officiels.",
    columns: ["Profil", "Tarif"],
    rows: [
      { label: "30 ans et moins", values: ["Annuel", "384 €*"] },
      { label: "31 - 74 ans", values: ["Annuel", "744 €*"] },
      { label: "75 ans et plus", values: ["Annuel", "492 €*"] },
    ],
    footnotes: ["* 1 mois offert si paiement comptant."],
  },
  {
    title: "45 trous semainier 5j/7",
    description: "Abonnements semaine.",
    columns: ["Profil", "Tarif"],
    rows: [
      { label: "74 ans et moins", values: ["Annuel", "1080 €*"] },
      { label: "Couple 74 ans et moins", values: ["Annuel", "1836 €*"] },
      { label: "75 ans et plus", values: ["Annuel", "816 €*"] },
      { label: "Couple 75 ans et plus", values: ["Annuel", "1428 €*"] },
    ],
    footnotes: ["* 1 mois offert si paiement comptant."],
  },
  {
    title: "45 trous temps plein 7j/7",
    description: "Abonnements temps plein et offres entreprise.",
    columns: ["Profil", "Tarif"],
    rows: [
      { label: "25 ans et moins", values: ["Annuel", "576 €*"] },
      { label: "26 ans - 35 ans", values: ["Annuel", "948 €*"] },
      { label: "Couple 26 ans - 35 ans", values: ["Annuel", "1512 €*"] },
      { label: "36 ans - 74 ans", values: ["Annuel", "1344 €*"] },
      { label: "Couple 36 ans - 74 ans", values: ["Annuel", "2292 €*"] },
      { label: "75 ans et plus", values: ["Annuel", "936 €*"] },
      { label: "Couple 75 ans et plus", values: ["Annuel", "1596 €*"] },
      { label: "Offre 2ème club", values: ["Annuel", "750 €"] },
      {
        label: "Carte entreprise",
        values: ["Sur devis", "de 2100 € à 4000 € HT"],
      },
    ],
    footnotes: ["* 1 mois offert si paiement comptant."],
  },
];

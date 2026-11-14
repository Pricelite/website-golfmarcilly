// Offres de groupes relevées sur la carte fournie par le propriétaire.
export const cocktailPackages = [
  { name: "Boggey", price: "5,00 €", drinks: "Kir sauvignon et jus de fruits", food: "3 feuilletés" },
  { name: "Par 1", price: "6,50 €", drinks: "Kir pétillant et jus de fruits", food: "3 feuilletés" },
  { name: "Par 2", price: "9,50 €", drinks: "Kir pétillant et jus de fruits", food: "3 canapés" },
  { name: "Birdie", price: "11,50 €", drinks: "Kir pétillant et jus de fruits", food: "5 canapés" },
  { name: "Eagle", price: "13,90 €", drinks: "Champagne et jus de fruits", food: "5 canapés sucrés-salés" },
] as const;

export const cocktailDinner = {
  pieces: "16 pièces par personne : 8 salées froides, 5 salées chaudes et 3 sucrées.",
  options: [
    { name: "Classique", description: "Forfait boissons limité : crémant, vins blanc, rouge et rosé, bières, eaux plates et gazeuses, sodas, jus de fruits et café." },
    { name: "Prestige", description: "Boissons à volonté pendant 3 heures : crémant, vins, bières, softs, eaux et café." },
  ],
  prices: [
    { guests: "10 à 20", classique: "55 €", prestige: "65 €" },
    { guests: "20 à 30", classique: "54 €", prestige: "64 €" },
    { guests: "30 à 40", classique: "53 €", prestige: "63 €" },
    { guests: "40 à 50", classique: "52 €", prestige: "62 €" },
  ],
} as const;

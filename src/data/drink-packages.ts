// Tarifs et quantités fournis par le propriétaire dans la capture.
export const drinkPackages = [
  { name: "Formule Élégance", price: "15 €", items: [
    { label: "Vin", value: "1 bouteille / 4 personnes" },
    { label: "Apéritif", value: "Non inclus" },
    { label: "Petits fours", value: "4 pièces / personne" },
    { label: "Eau", value: "Incluse" },
    { label: "Café", value: "Non inclus" },
  ] },
  { name: "Formule Gourmande", price: "22 €", items: [
    { label: "Vin", value: "1 bouteille / 3 personnes" },
    { label: "Apéritif", value: "1 verre / personne" },
    { label: "Petits fours", value: "6 pièces / personne" },
    { label: "Eau", value: "Incluse" },
    { label: "Café", value: "Inclus" },
  ] },
  { name: "Formule Prestige", price: "29 €", items: [
    { label: "Vin", value: "1 bouteille sélection / 3 personnes" },
    { label: "Apéritif", value: "1 coupe de champagne / personne" },
    { label: "Petits fours", value: "8 pièces / personne" },
    { label: "Eau", value: "Incluse" },
    { label: "Café", value: "Inclus" },
  ] },
] as const;

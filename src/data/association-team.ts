export const associationOffice = [
  { role: "Président", name: "Baltazar Caleiro", portrait: [831, 72] },
  { role: "Trésorier", name: "Didier Dupuis", portrait: [852, 142] },
  { role: "Secrétaire", name: "Clarisse Lefevre", portrait: [869, 211] },
] as const;

export const associationCommissions = [
  { role: "Commission senior", name: "Michel Higoa", portrait: [106, 315] },
  { role: "Commission sportive", name: "Eric Renedo", portrait: [269, 315] },
  { role: "Commission sponsoring", name: "Eric Renedo", portrait: [430, 315] },
  { role: "Commission femme", name: "Corinne Gagnant", portrait: [605, 316] },
  { role: "Commission académie", name: "Damien Gratte", portrait: [780, 317] },
] as const;

export const associationExOfficioMembers = [
  { name: "Damien Gratte", portrait: [780, 317] },
  { name: "Nathalie Gratte", portrait: null },
  { name: "Michel Simeurt", portrait: null },
] as const;

export const associationPermanentGuests = [
  { name: "Wahid Laouar", portrait: [176, 585] },
  { name: "Roman Lissowski", portrait: [318, 585] },
  { name: "Patrick Roland", portrait: [455, 585] },
  { name: "Caroline Bourgeon", portrait: [603, 585] },
  { name: "Adrien Lafuge", portrait: [745, 585] },
  { name: "Baptiste Courtachon", portrait: [877, 585] },
] as const;

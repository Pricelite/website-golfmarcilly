export type AssociationEvent = {
  id: string;
  title: string;
  start: string;
  end?: string; // Inclusive final day, YYYY-MM-DD.
  time?: string;
  note?: string;
  status?: "private" | "provisional";
};

// Source: https://www.marcilly.com/l-association, consulted 2026-09-15.
// Calendar year 2026 confirmed by the owner in the conversation.
// Numeric dates take precedence over inconsistent weekday labels (12-13 September).
// Omitted unnamed entries: July 5, August 31, September 6/27, October 25.
// Update this local list to maintain the calendar; no Google account or API needed.
const entries: Omit<AssociationEvent, "id">[] = [
  { start: "2026-03-15", title: "Coupe SweetSpot", note: "Scramble à 2" },
  { start: "2026-03-22", title: "Coupe de Classement" },
  { start: "2026-03-28", title: "Coupe de Classement Pitch & Putt" },
  { start: "2026-03-29", title: "Coupe de Classement" },
  { start: "2026-03-31", title: "Coupe de Printemps 1", note: "Ringer score" },
  { start: "2026-04-02", title: "Coupe de Classement" },
  { start: "2026-04-04", title: "Coupe de Classement Pitch & Putt" },
  { start: "2026-04-05", title: "Coupe de Classement" },
  { start: "2026-04-07", title: "Coupe de Printemps 2", note: "Ringer score" },
  { start: "2026-04-09", title: "Coupe de Classement" },
  { start: "2026-04-10", title: "After Work", time: "16:00", note: "9 trous + brasero, à partir de 16 h." },
  { start: "2026-04-11", title: "Coupe de Classement Pitch & Putt" },
  { start: "2026-04-12", title: "Coupe Citya" },
  { start: "2026-04-14", title: "Coupe de Printemps 3", note: "Ringer score" },
  { start: "2026-04-16", title: "Coupe de Classement" },
  { start: "2026-04-18", title: "Coupe de Classement Pitch & Putt" },
  { start: "2026-04-19", title: "Coupe de Classement" },
  { start: "2026-04-21", title: "Coupe de Printemps 4", note: "Ringer score" },
  { start: "2026-04-23", title: "Coupe Amical Séniors" },
  { start: "2026-04-24", title: "After Work", time: "16:00", note: "9 trous + brasero, à partir de 16 h." },
  { start: "2026-04-25", title: "Coupe de Classement Pitch & Putt" },
  { start: "2026-04-26", title: "Coupe Rothary" },
  { start: "2026-04-28", title: "Coupe de Printemps 5", note: "Ringer score" },
  { start: "2026-05-02", end: "2026-05-03", title: "Grand Prix Marcilly" },
  { start: "2026-05-07", title: "Coupe de Classement" },
  { start: "2026-05-10", title: "Coupe de Classement" },
  { start: "2026-05-14", title: "Coupe Eden Park" },
  { start: "2026-05-17", title: "Coupe de Classement" },
  { start: "2026-05-23", end: "2026-05-24", title: "Trophée SAFTI – ACE TRANS" },
  { start: "2026-05-31", title: "Coupe Menuiserie GODEL et RENOV’ CENTRE" },
  { start: "2026-06-04", title: "Compétition Amicale Séniors" },
  { start: "2026-06-06", title: "Coupe WAGC" },
  { start: "2026-06-07", title: "Coupe TLM" },
  { start: "2026-06-11", title: "Coupe de Classement" },
  { start: "2026-06-14", title: "Coupe Maserati" },
  { start: "2026-06-16", title: "Pro Am de Marcilly" },
  { start: "2026-06-18", title: "Coupe de Classement" },
  { start: "2026-06-20", title: "Coupe KIA" },
  { start: "2026-06-21", title: "Coupe de Classement" },
  { start: "2026-06-24", title: "Compétition golf entreprise" },
  { start: "2026-06-25", title: "Coupe de Classement" },
  { start: "2026-06-28", title: "Coupe Crit" },
  { start: "2026-07-04", title: "Compétition Golf entreprise" },
  { start: "2026-09-11", title: "AVC Sécurité", status: "private" },
  { start: "2026-09-12", end: "2026-09-13", title: "Championnat du Club" },
  { start: "2026-09-18", end: "2026-09-20", title: "Grand Prix Jeunes Marcilly" },
  { start: "2026-09-26", title: "Coupe Chic" },
  { start: "2026-10-03", title: "Compétition Golf Entreprise" },
  { start: "2026-10-04", title: "Coupe Octobre Rose" },
  { start: "2026-10-11", title: "Coupe Equip Jardin" },
  { start: "2026-10-15", title: "Compétition Amicale Séniors" },
  { start: "2026-10-18", title: "Coupe Soditra", status: "provisional", note: "Épreuve indiquée en option dans le programme." },
  { start: "2026-11-08", title: "Bregent / Bergerie" },
  { start: "2026-11-22", title: "Coupe Beaujolais" },
];

export const associationEvents: AssociationEvent[] = entries.map((event, index) => ({
  ...event, id: `${event.start}-${index}`,
}));

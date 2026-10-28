// Source : https://www.marcilly.com/enseignement — consultée le 16 septembre 2026.
// Horaires : affiche 2026–2027 du club. Tarif et inclusions : capture du club confirmée le 28 octobre 2026.
export const juniorPrograms = [
  { key: "baby-golf", title: "Baby Golf", price: "257 €", duration: "35 séances · 1 h par semaine", included: ["Licence 12 mois incluse", "Groupe Baby Golf inclus"], slots: ["Mercredi : 11 h – 12 h", "Samedi : 14 h – 15 h"] },
  { key: "loisir", title: "Loisir", price: "257 €", duration: "35 séances · 1 h par semaine", included: ["Licence 12 mois incluse", "Groupe Loisir inclus"], slots: ["Mercredi : 14 h – 15 h", "Samedi : 10 h – 11 h"] },
] as const;

export const adultCollectiveCoursePosterSrc = "/enseignement/cours-collectifs-adultes.png";

export const sportingLabelCriteria = [
  "Du temps pour progresser",
  "Des outils pédagogiques fédéraux",
  "Des bilans et un dialogue avec les familles",
  "Du jeu sur les parcours",
  "Un affichage dédié aux jeunes",
  "Des jeunes licenciés et membres de l’AS",
] as const;

export const teachingPros = [
  { name: "Adrien Lafuge", specialty: "Enseignant diplômé", image: "/adrien.png", website: "https://www.adrienlafuge.com", phone: "06 33 74 85 67", phoneHref: "+33633748567", email: "adrien.lafuge@outlook.fr" },
  { name: "Roman Lissowski", specialty: "Enseignant diplômé", image: "/roman.png", website: "https://www.romanlissowski.com", phone: "06 50 36 30 84", phoneHref: "+33650363084", email: "romanlissowski@hotmail.com" },
  { name: "Baptiste Courtachon", specialty: "Enseignant diplômé", image: "/baptiste.png", website: "https://baptistecourtachon.com", phone: "06 69 00 62 74", phoneHref: "+33669006274", email: "baptiste.courtachon@gmail.com" },
] as const;

export const teachingFaqs = [
  { question: "Comment inscrire mon enfant ?", answer: "Contactez l’accueil en indiquant son âge, son expérience du golf et vos disponibilités. Demandez la confirmation du groupe, du créneau et des modalités avant l’inscription." },
  { question: "Que vérifier avant le premier cours ?", answer: "Renseignez-vous sur le matériel à apporter ou à emprunter, la tenue conseillée, le lieu de rendez-vous et les formalités à prévoir." },
  { question: "Les cours ont-ils lieu pendant les vacances ?", answer: "Demandez à l’accueil le calendrier de la saison, les périodes de cours et les éventuelles interruptions." },
  { question: "Comment connaître le prix d’un cours adulte ?", answer: "Pour un cours collectif, renseignez-vous auprès de l’accueil. Pour un cours particulier, contactez directement le pro de votre choix pour connaître ses formules, ses tarifs et ses disponibilités." },
] as const;

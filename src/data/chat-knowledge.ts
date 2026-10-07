import { academy } from "@/data/academy";
import { associationGroups } from "@/data/association";
import { courses } from "@/data/courses";
import { eventFormats, eventIdeas } from "@/data/events";
import { pricingSections } from "@/data/pricing";
import { restaurantFaqs } from "@/data/restaurant";
import { siteConfig } from "@/data/site";
import { juniorPrograms, teachingFaqs } from "@/data/teaching";

export type ChatKnowledgeEntry = {
  title: string;
  path: string;
  summary: string;
  facts: string;
  keywords: string;
};

// Contenu public du site uniquement. Les disponibilités et offres temporaires ne sont pas incluses.
export const chatKnowledge: ChatKnowledgeEntry[] = [
  {
    title: "Découvrir le Golf de Marcilly",
    path: "/",
    summary: "Le Golf de Marcilly propose des parcours, un practice, des cours et le restaurant La Bergerie.",
    facts: "Le site présente 45 trous aux portes d’Orléans.",
    keywords: "accueil club marcilly golf visite",
  },
  {
    title: "Parcours et practice",
    path: "/golf",
    summary: "Le golf propose un practice, un parcours découverte 9 trous, un Pitch & Putt / Kaleka 18 trous et un parcours compétitions 18 trous.",
    facts: courses.map((course) => `${course.title} : ${course.description}`).join("\n"),
    keywords: "golf parcours trous practice footgolf jouer débutant entrainement",
  },
  ...pricingSections.map((section) => ({
    title: `Tarifs 2026 — ${section.title}`,
    path: "/tarifs",
    summary: `Les tarifs ${section.title.toLowerCase()} sont détaillés sur la page Tarifs.`,
    facts: `${section.description}\nColonnes : ${section.columns.join(" / ")}\n${section.rows.map((row) => `${row.label} : ${row.values.join(" / ")}${row.note ? ` (${row.note})` : ""}`).join("\n")}${section.footnotes ? `\n${section.footnotes.join("\n")}` : ""}`,
    keywords: `prix tarif combien coûte ${section.title}`,
  })),
  {
    title: "Débuter le golf",
    path: "/je-debute-le-golf",
    summary: "La page Je débute le golf aide à choisir une première expérience. Une demande d’initiation peut se faire en ligne, puis l’équipe confirme le créneau ; le règlement se fait sur place.",
    facts: "La réservation d’initiation actuelle passe par /initiation/reservation. La demande est confirmée par l’équipe et le paiement se fait sur place.",
    keywords: "débuter débutant initiation découverte premier cours apprendre réserver",
  },
  {
    title: "École de golf et cours",
    path: "/enseignement",
    summary: "L’école de golf accueille les jeunes ; le site présente aussi des cours collectifs adultes et des cours particuliers avec les enseignants.",
    facts: `${juniorPrograms.map((program) => `${program.title} : ${program.price} par saison, ${program.duration}, ${program.slots.join(" ou ")}`).join("\n")}\n${teachingFaqs.map((faq) => `${faq.question} ${faq.answer}`).join("\n")}`,
    keywords: "enseignement école enfant enfants jeune jeunes adulte cours professeur pro inscription saison",
  },
  {
    title: "Académie du golf",
    path: "/academie",
    summary: "L’académie présente l’accompagnement des jeunes et les portraits de Camille Da Violante et Sarah Gratté.",
    facts: `${academy.introduction} Jeunes présentés : ${academy.youngGolfers.map((golfer) => golfer.name).join(", ")}.`,
    keywords: "académie acadomia jeunes enfants camille sarah",
  },
  {
    title: "Restaurant La Bergerie",
    path: "/restaurant",
    summary: "La Bergerie accueille les golfeurs et les visiteurs extérieurs pour déjeuner. Le site présente des menus de groupes et des réceptions sur devis.",
    facts: `${siteConfig.hours.find((hour) => hour.label === "Restaurant")?.value ?? ""}\n${restaurantFaqs.map((faq) => `${faq.question} ${faq.answer}`).join("\n")}`,
    keywords: "restaurant bergerie déjeuner manger repas menu groupe réservation mardi horaires privatiser",
  },
  {
    title: "Événements et séminaires",
    path: "/evenements",
    summary: "Le site propose des idées de séminaires, de team building, de découvertes du golf et de réceptions, à construire avec l’équipe sur devis.",
    facts: `${eventFormats.map((format) => `${format.title} : ${format.description}`).join("\n")}\nIdées : ${eventIdeas.map((idea) => idea.title).join(", ")}.`,
    keywords: "événement séminaire entreprise team building devis réception footgolf groupe",
  },
  {
    title: "Association sportive et seniors",
    path: "/association-sportive",
    summary: "L’association sportive rassemble les joueurs du club. La page présente les équipes, les seniors et l’académie.",
    facts: associationGroups.map((group) => `${group.title} : ${group.description}`).join("\n"),
    keywords: "association sportive compétition seniors équipe calendrier résultats départs",
  },
  {
    title: "Réserver un départ",
    path: "/golf",
    summary: "Le bouton « Réserver un départ » du site ouvre le service de réservation du golf. Les disponibilités doivent y être vérifiées directement.",
    facts: `Service externe de réservation : ${siteConfig.reservationUrl}. Aucune disponibilité en temps réel dans ce chatbot.`,
    keywords: "réserver départ tee time créneau disponibilité voiturette réservation",
  },
  {
    title: "Contacter le golf",
    path: "/contact",
    summary: `Vous pouvez contacter le golf au ${siteConfig.phoneDisplay} ou à ${siteConfig.email}.`,
    facts: `Adresse : ${siteConfig.addressLine1}, ${siteConfig.addressLine2}. Téléphone : ${siteConfig.phoneDisplay}. Email : ${siteConfig.email}.`,
    keywords: "contact téléphone appeler email adresse renseignement inconnu confirmer situés localisation où trouver venir accès itinéraire",
  },
  {
    title: "Partenaires",
    path: "/partenaires",
    summary: "Les partenaires du Golf de Marcilly sont présentés sur la page Partenaires.",
    facts: "Consultez la page pour les partenaires affichés actuellement.",
    keywords: "partenaire sponsor entreprise",
  },
];

export function normalizeChatText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const stopWords = new Set(["a", "au", "aux", "de", "des", "du", "en", "est", "et", "golf", "je", "jouer", "la", "le", "les", "mon", "pour", "que", "quel", "quelle", "quels", "quelles", "un", "une", "vous"]);

export function selectChatKnowledge(question: string, limit = 4): ChatKnowledgeEntry[] {
  const tokens = normalizeChatText(question).match(/[a-z0-9]{3,}/g)?.filter((token) => !stopWords.has(token)) ?? [];
  const hasWord = (value: string, token: string) => new RegExp(`(^|[^a-z0-9])${token}(?=$|[^a-z0-9])`).test(value);
  const ranked = chatKnowledge.map((entry) => {
    const title = normalizeChatText(entry.title);
    const keywords = normalizeChatText(entry.keywords);
    const facts = normalizeChatText(`${entry.summary} ${entry.facts}`);
    const rawScore = tokens.reduce((total, token) => total + (hasWord(title, token) ? 4 : 0) + (hasWord(keywords, token) ? 3 : 0) + (hasWord(facts, token) ? 1 : 0), 0);
    const score = entry.path === "/" ? rawScore * 0.2 : rawScore;
    return { entry, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit).map((item) => item.entry);
}

export const chatbotContent = {
  name: "Welix",
  greeting: "Bonjour ! Je suis Welix, l’assistant IA du Golf de Marcilly. Je peux vous orienter sur les parcours, les cours et La Bergerie. Que cherchez-vous ?",
  demoGreeting: "Bonjour ! Je suis Welix, l’assistant IA du Golf de Marcilly. Je fonctionne ici en mode démo avec les informations du site. Que cherchez-vous ?",
  welcomeOffer: "Bonjour ! Je suis votre caddie virtuel du Golf de Marcilly ⛳ Besoin d’un coup de main pour explorer le site ?",
  contextOffer: {
    "/restaurant": "Une question sur La Bergerie ou les repas de groupe ? Je peux vous guider.",
    "/enseignement": "Vous cherchez un cours ou l’école de golf ? Je peux vous orienter.",
    "/tarifs": "Besoin de retrouver un tarif sur cette page ? Je peux vous aider.",
    "/evenements": "Vous préparez un événement au golf ? Je peux vous indiquer les formats présentés ici.",
  } as Record<string, string>,
  defaultContextOffer: "Vous cherchez une information sur cette page ? Je peux vous guider.",
  suggestions: [
    "Je débute le golf, par où commencer ?",
    "Quels parcours proposez-vous ?",
    "Peut-on déjeuner sans jouer au golf ?",
    "Comment contacter le golf ?",
  ],
} as const;

export const welixBehavior = {
  firstWelcomeDelayMs: 5_000,
  idleHelpDelayMs: 45_000,
  retryWhileBusyMs: 5_000,
  offerDurationMs: 12_000,
  maxAutomaticMovePx: 24,
  dragKeyboardStepPx: 8,
  desktopSizePx: 96,
  mobileSizePx: 80,
  mobileBottomClearancePx: 112,
  desktopBottomClearancePx: 24,
  screenMarginPx: 8,
  topClearancePx: 80,
} as const;

export const chatbotContent = {
  name: "Welix",
  greeting: "Bonjour ! Je suis Welix, l’assistant IA du Golf de Marcilly. Je peux vous orienter sur les parcours, les cours et La Bergerie. Que cherchez-vous ?",
  demoGreeting: "Bonjour ! Je suis Welix, l’assistant IA du Golf de Marcilly. Je fonctionne ici en mode démo avec les informations du site. Que cherchez-vous ?",
  welcomeOffer: "Bonjour ! Je suis Welix, l’assistant IA du Golf de Marcilly. Est-ce que je peux vous aider ?",
  suggestions: [
    "Je débute le golf, par où commencer ?",
    "Quels parcours proposez-vous ?",
    "Peut-on déjeuner sans jouer au golf ?",
    "Comment contacter le golf ?",
  ],
} as const;

export const welixBehavior = {
  firstWelcomeDelayMs: 2_500,
  retryWhileBusyMs: 5_000,
  offerDurationMs: 20_000,
  maxAutomaticMovePx: 24,
  idleWalkDelayMs: 18_000,
  idleWalkDistancePx: 48,
  walkOutDurationMs: 1_100,
  walkTotalDurationMs: 2_400,
  swingDurationMs: 1_150,
  dragThresholdPx: 7,
  dragKeyboardStepPx: 8,
  desktopSizePx: 96,
  mobileSizePx: 80,
  mobileBottomClearancePx: 112,
  desktopBottomClearancePx: 24,
  screenMarginPx: 8,
  topClearancePx: 80,
} as const;

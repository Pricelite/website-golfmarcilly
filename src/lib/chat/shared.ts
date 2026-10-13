export type ChatTurn = { role: "user" | "assistant"; content: string };
export type ChatLink = { href: string; label: string };
export type ChatReply = { answer: string; links: ChatLink[]; mode: "ai" | "demo" };

export const MAX_CHAT_MESSAGE_LENGTH = 800;
export const MAX_CHAT_HISTORY = 10;
export const MAX_CHAT_ANSWER_LENGTH = 800;

export const chatAllowedPaths = [
  "/", "/golf", "/tarifs", "/enseignement", "/restaurant", "/evenements",
  "/association-sportive", "/partenaires", "/contact", "/academie",
  "/je-debute-le-golf", "/initiation/reservation", "/reserver-un-cours",
] as const;

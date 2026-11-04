import { isValidEmail } from "@/lib/api/public-form-validation";

export const feedbackTypes = ["Remarque", "Bug", "Autre"] as const;
export const MAX_FEEDBACK_LENGTH = 4000;
export type Feedback = { type: typeof feedbackTypes[number]; message: string; email: string; page: string };

export function parseFeedback(value: Record<string, unknown>, now = Date.now()): Feedback | null {
  if (!feedbackTypes.includes(value.type as Feedback["type"]) || typeof value.message !== "string" ||
    typeof value.email !== "string" || typeof value.page !== "string" || value.website !== "" ||
    typeof value.openedAt !== "number" || !Number.isFinite(value.openedAt) ||
    now - value.openedAt < 2000 || now - value.openedAt > 7_200_000) return null;
  const message = value.message.trim();
  const email = value.email.trim();
  const page = value.page;
  if (!message || message.length > MAX_FEEDBACK_LENGTH || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message) ||
    email.length > 254 || (email && (!isValidEmail(email) || /[\r\n,;<>]/.test(email))) ||
    !/^\/(?!\/)/.test(page) || page.length > 512 || /[\s?#\\\u0000-\u001f\u007f]/.test(page)) return null;
  try {
    const url = new URL(page, "https://feedback.invalid");
    if (url.origin !== "https://feedback.invalid" || url.pathname !== page) return null;
  } catch { return null; }
  return { type: value.type as Feedback["type"], message, email, page };
}

export function feedbackMail(feedback: Feedback, origin: string, sentAt: Date) {
  return {
    subject: `[Site Golf de Marcilly] ${feedback.type}`,
    text: ["Message destiné à l’administrateur du site", `Type : ${feedback.type}`,
      `E-mail du visiteur : ${feedback.email || "Non renseigné"}`,
      `Page d’origine : ${new URL(feedback.page, origin).href}`,
      `Date d’envoi : ${sentAt.toISOString()}`, "", "Message :", feedback.message].join("\n"),
    ...(feedback.email ? { replyTo: feedback.email } : {}),
  };
}

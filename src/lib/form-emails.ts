import "server-only";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function line(label: string, value: string) {
  return `${label}: ${value || "-"}`;
}

export function buildContactEmail(input: {
  context: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const fullName = `${input.firstName} ${input.lastName}`.trim();
  const contextLabel =
    input.context === "restaurant" ? "Restaurant" : "Contact";
  const subject = `[${contextLabel}] ${fullName}`;

  const text = [
    `Nouvelle demande ${contextLabel.toLowerCase()}`,
    "",
    line("Prenom", input.firstName),
    line("Nom", input.lastName),
    line("Telephone", input.phone ?? "-"),
    line("Email", input.email),
    line("Objet", input.subject ?? "-"),
    "",
    "Message:",
    input.message,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#10201b;line-height:1.6">
      <h2 style="margin:0 0 12px">Nouvelle demande ${escapeHtml(contextLabel.toLowerCase())}</h2>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        <tbody>
          <tr><td style="padding:6px 0;font-weight:700">Prenom</td><td style="padding:6px 0">${escapeHtml(input.firstName)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Nom</td><td style="padding:6px 0">${escapeHtml(input.lastName)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Telephone</td><td style="padding:6px 0">${escapeHtml(input.phone ?? "-")}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Email</td><td style="padding:6px 0">${escapeHtml(input.email)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Objet</td><td style="padding:6px 0">${escapeHtml(input.subject ?? "-")}</td></tr>
        </tbody>
      </table>
      <div style="margin-top:18px">
        <p style="margin:0 0 8px;font-weight:700">Message</p>
        <p style="margin:0;white-space:pre-wrap">${escapeHtml(input.message)}</p>
      </div>
    </div>
  `;

  return { subject, text, html, replyToName: fullName };
}

export function buildQuoteEmail(input: {
  company: string;
  email: string;
  eventType: string;
  participants?: string;
  details: string;
}) {
  const subject = `[Devis] ${input.company} - ${input.eventType}`;
  const text = [
    "Nouvelle demande de devis",
    "",
    line("Entreprise / organisateur", input.company),
    line("Email", input.email),
    line("Type d'evenement", input.eventType),
    line("Participants", input.participants ?? "-"),
    "",
    "Besoin detaille:",
    input.details,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#10201b;line-height:1.6">
      <h2 style="margin:0 0 12px">Nouvelle demande de devis</h2>
      <table style="border-collapse:collapse;width:100%;max-width:640px">
        <tbody>
          <tr><td style="padding:6px 0;font-weight:700">Entreprise / organisateur</td><td style="padding:6px 0">${escapeHtml(input.company)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Email</td><td style="padding:6px 0">${escapeHtml(input.email)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Type d'evenement</td><td style="padding:6px 0">${escapeHtml(input.eventType)}</td></tr>
          <tr><td style="padding:6px 0;font-weight:700">Participants</td><td style="padding:6px 0">${escapeHtml(input.participants ?? "-")}</td></tr>
        </tbody>
      </table>
      <div style="margin-top:18px">
        <p style="margin:0 0 8px;font-weight:700">Besoin detaille</p>
        <p style="margin:0;white-space:pre-wrap">${escapeHtml(input.details)}</p>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export function buildNewsletterEmail(input: { email: string }) {
  return {
    subject: `[Newsletter] ${input.email}`,
    text: ["Nouvelle inscription newsletter", "", line("Email", input.email)].join(
      "\n",
    ),
    html: `
      <div style="font-family:Arial,sans-serif;color:#10201b;line-height:1.6">
        <h2 style="margin:0 0 12px">Nouvelle inscription newsletter</h2>
        <p style="margin:0"><strong>Email :</strong> ${escapeHtml(input.email)}</p>
      </div>
    `,
  };
}

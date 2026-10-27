import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.local");
if (existsSync(envPath)) process.loadEnvFile(envPath);

const issues = [];
const value = name => process.env[name]?.trim() || "";
const requireValue = (name, reason) => {
  if (!value(name)) issues.push(`${name} : ${reason}`);
};
const validHttps = name => {
  const raw = value(name);
  if (!raw) return false;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && Boolean(url.hostname) &&
      !["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname) &&
      !url.username && !url.password;
  } catch { return false; }
};

if (!validHttps("NEXT_PUBLIC_SITE_URL")) issues.push("NEXT_PUBLIC_SITE_URL : URL HTTPS publique requise (pas localhost).");
if (!validHttps("NEXT_PUBLIC_SUPABASE_URL")) issues.push("NEXT_PUBLIC_SUPABASE_URL : URL HTTPS du projet Supabase requise.");
for (const name of ["SUPABASE_SERVICE_ROLE_KEY", "INITIATION_CALENDAR_ICS_URL", "EMAIL_TO", "EMAIL_FROM", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET", "OPS_CRON_TOKEN", "BACKOFFICE_DB_PATH"]) {
  requireValue(name, "valeur de production requise.");
}
const calendar = value("INITIATION_CALENDAR_ICS_URL");
if (calendar) {
  try {
    const url = new URL(calendar);
    if (url.protocol !== "https:" || url.hostname !== "calendar.google.com" || !url.pathname.startsWith("/calendar/ical/")) {
      issues.push("INITIATION_CALENDAR_ICS_URL : flux privé Google Calendar invalide.");
    }
  } catch { issues.push("INITIATION_CALENDAR_ICS_URL : URL invalide."); }
}
const dbPath = value("BACKOFFICE_DB_PATH");
if (dbPath) {
  const resolved = resolve(dbPath);
  const publicRoot = resolve(root, "public");
  const temporaryRoot = resolve(tmpdir());
  if (!isAbsolute(dbPath) || resolved === publicRoot || resolved.startsWith(publicRoot + sep)) {
    issues.push("BACKOFFICE_DB_PATH : chemin absolu hors du dossier public requis.");
  }
  if (resolved === temporaryRoot || resolved.startsWith(temporaryRoot + sep)) {
    issues.push("BACKOFFICE_DB_PATH : le dossier temporaire n'est pas un stockage persistant pour le back-office.");
  }
}
const provider = value("MAIL_PROVIDER").toLowerCase();
if (value("CONTENT_SYNC_TOKEN") && value("CONTENT_SYNC_TOKEN").length < 32) issues.push("CONTENT_SYNC_TOKEN : au moins 32 caractères aléatoires requis.");
if (provider === "brevo") requireValue("BREVO_API_KEY", "clé Brevo requise.");
else if (provider === "smtp") {
  for (const name of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]) requireValue(name, "configuration SMTP requise.");
  const port = Number(value("SMTP_PORT"));
  if (value("SMTP_PORT") && (!Number.isInteger(port) || port < 1 || port > 65535)) issues.push("SMTP_PORT : port invalide.");
} else issues.push("MAIL_PROVIDER : choisir explicitement brevo ou smtp.");

if (issues.length) {
  console.error(`Préparation production : ${issues.length} point(s) à régler. Aucune valeur secrète n'est affichée.`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log("Configuration de production présente et cohérente. Vérifier encore les migrations, la délivrabilité des emails et les parcours réels après déploiement.");
}

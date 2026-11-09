import { homeAds, type ManagedHomeAd } from "@/data/home-ads";

export const MAX_AD_IMAGE_BYTES = 5_000_000;
export const validHomeAdId = (id: unknown): id is string => typeof id === "string" && /^(default-(left|right)-\d{1,2}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/.test(id);
export const validAdImageId = (id: string) => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);
export function validHomeAdImage(value: string) {
  return [...homeAds.left, ...homeAds.right].some(ad => ad.image === value)
    || (value.startsWith("/api/home-ad-images/") && validAdImageId(value.slice("/api/home-ad-images/".length)));
}
function dateValid(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "2026-01-01" || value > "2199-12-31") return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function safeUrl(value: string) {
  if (/\s|[\\\x00-\x1f\x7f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
export function parseManagedHomeAd(value: unknown): { ok: true; ad: Omit<ManagedHomeAd, "id"> } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "Annonce invalide." };
  const data = value as Record<string, unknown>;
  for (const key of ["advertiser", "image", "imageAlt", "url", "caption", "kind", "startsOn", "endsOn", "side"]) {
    if (data[key] !== undefined && typeof data[key] !== "string") return { ok: false, error: "Les champs doivent contenir du texte." };
  }
  const advertiser = (data.advertiser as string | undefined)?.trim() ?? "";
  const image = (data.image as string | undefined) ?? "";
  const imageAlt = (data.imageAlt as string | undefined)?.trim() ?? "";
  const url = (data.url as string | undefined)?.trim() || undefined;
  const caption = (data.caption as string | undefined)?.trim() || undefined;
  const startsOn = (data.startsOn as string | undefined) || undefined;
  const endsOn = (data.endsOn as string | undefined) || undefined;
  const kind = (data.kind as string | undefined) || undefined;
  if (!advertiser || advertiser.length > 120) return { ok: false, error: "Indiquez un titre de 1 à 120 caractères." };
  if (!imageAlt || imageAlt.length > 300) return { ok: false, error: "Décrivez le visuel en 1 à 300 caractères." };
  if (!validHomeAdImage(image)) return { ok: false, error: "Choisissez un visuel existant ou ajoutez une image." };
  if (url && (url.length > 1000 || !safeUrl(url))) return { ok: false, error: "Indiquez un lien HTTPS valide ou une adresse commençant par / pour une page du site." };
  if (caption && caption.length > 240) return { ok: false, error: "Le sous-titre est limité à 240 caractères." };
  if ((startsOn && !dateValid(startsOn)) || (endsOn && !dateValid(endsOn))) return { ok: false, error: "Indiquez des dates valides entre 2026 et 2199." };
  if (startsOn && endsOn && endsOn < startsOn) return { ok: false, error: "La fin de diffusion doit être postérieure ou égale au début." };
  if (kind && !["event", "house", "example"].includes(kind)) return { ok: false, error: "Choisissez un type d’annonce valide." };
  if (!["left", "right", "both"].includes(data.side as string) || typeof data.enabled !== "boolean" || !Number.isInteger(data.position) || (data.position as number) < 0 || (data.position as number) > 1000) return { ok: false, error: "Vérifiez l’emplacement, l’activation et l’ordre de l’annonce." };
  return { ok: true, ad: { advertiser, image, imageAlt, url, caption, startsOn, endsOn, kind: kind as ManagedHomeAd["kind"], side: data.side as ManagedHomeAd["side"], enabled: data.enabled, position: data.position as number } };
}

export function adImageMime(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (!bytes.length || bytes.length > MAX_AD_IMAGE_BYTES) return null;
  if (bytes.length > 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (bytes.length > 8 && [137,80,78,71,13,10,26,10].every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes.length > 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

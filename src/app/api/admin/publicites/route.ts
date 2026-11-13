import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { canAccessAdmin } from "@/lib/admin-access";
import { consumeRateLimit, hasTrustedOrigin, parseClientIpFromHeaders } from "@/lib/security/request-guards";
import { readLimitedBytesBody } from "@/lib/api/request-body";
import { homeAdsCacheTag, listManagedHomeAds, saveManagedHomeAd } from "@/lib/home-ads-store";
import { MAX_AD_IMAGE_BYTES, parseManagedHomeAd, validHomeAdId } from "@/lib/home-ads-validation";
import { prepareHomeAdImage } from "@/lib/home-ad-image";

export const runtime = "nodejs";
const response = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
async function authorized() { return canAccessAdmin("publicites"); }

export async function GET() {
  if (!await authorized()) return response({ error: "Connectez-vous à l’administration pour continuer." }, 401);
  try { return response({ ads: await listManagedHomeAds() }); }
  catch { return response({ error: "Les publicités sont momentanément indisponibles. Réessayez plus tard." }, 503); }
}

export async function PUT(request: Request) {
  if (!await authorized()) return response({ error: "Connectez-vous à l’administration pour continuer." }, 401);
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return response({ error: "Origine non autorisée. Rechargez la page." }, 403);
  const limit = await consumeRateLimit({ namespace: "admin-home-ads", identifier: parseClientIpFromHeaders(request.headers), limit: 30, windowMs: 60_000 });
  if (!limit.allowed) return response({ error: "Veuillez patienter une minute avant de réessayer. Votre saisie est conservée." }, limit.unavailable ? 503 : 429);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) return response({ error: "Format de demande invalide." }, 415);
  const body = await readLimitedBytesBody(request, MAX_AD_IMAGE_BYTES + 32_768);
  if (!body.ok) return response({ error: body.tooLarge ? "L’image est limitée à 5 Mo." : "Demande invalide." }, body.tooLarge ? 413 : 400);
  let fields: FormData;
  let input: Record<string, unknown>;
  try {
    fields = await new Request(request.url, { method: "POST", headers: { "Content-Type": request.headers.get("content-type")! }, body: Buffer.from(body.bytes) }).formData();
    const source = fields.get("ad");
    if (typeof source !== "string" || source.length > 16_384) return response({ error: "Annonce invalide." }, 400);
    input = JSON.parse(source);
  } catch { return response({ error: "Demande invalide." }, 400); }
  if (!input || typeof input !== "object" || !validHomeAdId(input.id)) return response({ error: "Identifiant d’annonce invalide." }, 400);
  const file = fields.get("image");
  if (file !== null && (!(file instanceof File) || file.size < 1 || file.size > MAX_AD_IMAGE_BYTES)) return response({ error: "Ajoutez une image JPEG, PNG ou WebP de 5 Mo maximum." }, 400);
  // A new uploaded visual replaces this placeholder only after decoding and validation.
  const parsed = parseManagedHomeAd(file instanceof File ? { ...input, image: "/ads/horaires-hiver.svg" } : input);
  if (!parsed.ok) return response({ error: parsed.error }, 400);
  let imageBytes: Uint8Array | undefined;
  if (file instanceof File) {
    try { imageBytes = await prepareHomeAdImage(new Uint8Array(await file.arrayBuffer())); }
    catch { return response({ error: "Image illisible ou trop grande. Choisissez une image JPEG, PNG ou WebP non animée de moins de 40 millions de pixels." }, 400); }
  }
  try {
    if (!imageBytes && parsed.ad.image.startsWith("/api/home-ad-images/")) {
      const existing = await listManagedHomeAds();
      if (!existing.some(ad => ad.image === parsed.ad.image)) return response({ error: "Ce visuel n’existe plus. Ajoutez une nouvelle image." }, 400);
    }
    const ad = await saveManagedHomeAd({ ...parsed.ad, id: input.id }, imageBytes);
    revalidateTag(homeAdsCacheTag, { expire: 0 });
    return response({ ad });
  } catch { return response({ error: "Enregistrement impossible. Vérifiez la connexion, puis réessayez. Votre saisie est conservée." }, 503); }
}

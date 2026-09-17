import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { hasTrustedOrigin } from "@/lib/security/request-guards";
import { CalendarStoreError, deleteAssociationEvent, saveAssociationEvent } from "@/lib/association-events-db";
import { parseEventInput, validEventId } from "@/lib/association-events-validation";

export const runtime = "nodejs";

function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

async function mutate(request: Request) {
  try {
    if (!process.env.ADMIN_PASSWORD || !(await isAdminAuthenticated(await cookies()))) return response({ error: "Connectez-vous à l’administration pour continuer." }, 401);
    if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return response({ error: "Origine non autorisée. Rechargez la page." }, 403);
    if (!request.headers.get("content-type")?.includes("application/json")) return response({ error: "Format de demande invalide." }, 415);
    const raw = await request.text();
    if (raw.length > 16_000) return response({ error: "Demande trop volumineuse." }, 413);
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { return response({ error: "Demande invalide." }, 400); }
    const id = payload && typeof payload === "object" ? (payload as Record<string, unknown>).id : undefined;
    if (request.method !== "POST" && !validEventId(id)) return response({ error: "Identifiant de compétition invalide." }, 400);
    if (request.method === "DELETE") {
      await deleteAssociationEvent(id as string);
      return response({ ok: true });
    }
    const parsed = parseEventInput(payload);
    if (!parsed.ok) return response({ error: parsed.error }, 400);
    const event = await saveAssociationEvent(parsed.event, request.method === "PATCH" ? id as string : undefined);
    return response({ event }, request.method === "POST" ? 201 : 200);
  } catch (error) {
    if (error instanceof CalendarStoreError && error.reason === "not_found") return response({ error: "Cette compétition n’existe plus. Rechargez la page." }, 404);
    return response({ error: "Enregistrement impossible. Vérifiez la connexion et la configuration du calendrier, puis réessayez." }, 503);
  }
}

export const POST = mutate;
export const PATCH = mutate;
export const DELETE = mutate;

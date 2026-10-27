import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { CalendarStoreError, deleteAssociationEvent, listAssociationEvents, saveAssociationEvent } from "@/lib/association-events-db";
import { parseEventInput, validEventId } from "@/lib/association-events-validation";
import { readJsonBody } from "@/lib/api/request-body";
import { hasValidOpsToken } from "@/lib/ops/auth";
import { deleteDailyMenu, getDailyMenu, getLatestDailyMenu, saveDailyMenu } from "@/lib/restaurant/daily-menu-store";
import { parseDailyMenu, validDailyMenuDate } from "@/lib/restaurant/daily-menu-validation";
import { parseConditionItem, parseConditionState, parseSyncedConditionInput } from "@/lib/site-conditions";
import { listConditionStates, listSiteConditions, saveConditionItem, saveConditionState, saveSiteCondition } from "@/lib/site-conditions-store";

export const runtime = "nodejs";

const reply = (result: unknown, status = 200) => NextResponse.json({ result }, { status, headers: { "Cache-Control": "no-store" } });
const fail = (error: string, status: number) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

export async function POST(request: Request) {
  const token = process.env.CONTENT_SYNC_TOKEN?.trim();
  if (process.env.NODE_ENV !== "production" || !token || token.length < 32) return fail("Service indisponible.", 503);
  if (request.headers.has("origin") || !hasValidOpsToken(request, token)) return fail("Accès refusé.", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return fail("Format invalide.", 415);
  const body = await readJsonBody<{ action?: unknown; payload?: unknown }>(request, 10_000);
  if (!body.ok) return fail("Demande invalide.", body.tooLarge ? 413 : 400);
  const { action, payload } = body.data;
  if (typeof action !== "string") return fail("Action invalide.", 400);

  try {
    switch (action) {
      case "conditions:list": return reply(await listSiteConditions());
      case "conditions:states": return reply(await listConditionStates());
      case "conditions:save": {
        const [items, states] = await Promise.all([listSiteConditions(), listConditionStates()]);
        const parsed = parseSyncedConditionInput(payload, items.map(item => item.id), states);
        if (!parsed.ok) return fail(parsed.error, 400);
        const result = await saveSiteCondition(parsed.condition);
        revalidatePath("/");
        return reply(result);
      }
      case "conditions:item": {
        const parsed = parseConditionItem(payload);
        if (!parsed.ok) return fail(parsed.error, 400);
        const result = await saveConditionItem(parsed.item);
        revalidatePath("/");
        return reply(result);
      }
      case "conditions:state": {
        const parsed = parseConditionState(payload);
        if (!parsed.ok) return fail(parsed.error, 400);
        await saveConditionState(parsed.state);
        return reply(null);
      }
      case "menu:get":
      case "menu:latest": {
        const date = record(payload)?.date;
        if (!validDailyMenuDate(date)) return fail("Date invalide.", 400);
        return reply(action === "menu:get" ? await getDailyMenu(date) : await getLatestDailyMenu(date));
      }
      case "menu:save": {
        const parsed = parseDailyMenu(payload);
        if (!parsed.ok) return fail(parsed.error, 400);
        const result = await saveDailyMenu(parsed.menu);
        revalidatePath("/restaurant");
        return reply(result);
      }
      case "menu:delete": {
        const date = record(payload)?.date;
        if (!validDailyMenuDate(date)) return fail("Date invalide.", 400);
        const result = await deleteDailyMenu(date);
        revalidatePath("/restaurant");
        return reply(result);
      }
      case "events:list": return reply(await listAssociationEvents());
      case "events:save": {
        const input = record(payload);
        const id = input?.id;
        if (id !== undefined && !validEventId(id)) return fail("Identifiant invalide.", 400);
        const parsed = parseEventInput(input?.event);
        if (!parsed.ok) return fail(parsed.error, 400);
        const result = await saveAssociationEvent(parsed.event, id as string | undefined);
        revalidatePath("/association-sportive");
        return reply(result);
      }
      case "events:delete": {
        const id = record(payload)?.id;
        if (!validEventId(id)) return fail("Identifiant invalide.", 400);
        await deleteAssociationEvent(id);
        revalidatePath("/association-sportive");
        return reply(null);
      }
      default: return fail("Action inconnue.", 400);
    }
  } catch (error) {
    if (error instanceof CalendarStoreError && error.reason === "not_found") return fail("Compétition introuvable.", 404);
    return fail("Contenu momentanément indisponible.", 503);
  }
}

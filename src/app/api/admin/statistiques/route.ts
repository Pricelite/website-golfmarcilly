import { NextResponse } from "next/server";

import { canViewStatistics } from "@/lib/analytics/admin";
import { parisDay, reportRange } from "@/lib/analytics/core";
import { loadReport } from "@/lib/analytics/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!await canViewStatistics()) return NextResponse.json({ error: "Accès réservé aux administrateurs." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const params = new URL(request.url).searchParams;
  const range = reportRange(params.get("start"), params.get("end"), parisDay(new Date()));
  if (!range) return NextResponse.json({ error: "Période invalide (366 jours maximum, sans date future)." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  try {
    const report = await loadReport(range.start, range.end);
    return NextResponse.json({ ...report, range }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Statistiques indisponibles. Vérifiez la configuration et la migration de la base." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

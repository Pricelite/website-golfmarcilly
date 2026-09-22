import { NextResponse } from "next/server";
import { getInitiationOptions } from "@/lib/initiation/calendar-options-server";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, slots: await getInitiationOptions() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

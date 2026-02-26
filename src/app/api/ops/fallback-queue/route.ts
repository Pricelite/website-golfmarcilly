import { NextRequest, NextResponse } from "next/server";

import { processContactFallbackQueue } from "@/lib/contact/fallback-store";

function methodNotAllowed(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "GET, POST" } }
  );
}

function getTokenFromRequest(request: NextRequest): string {
  const bearer = request.headers.get("authorization")?.trim();
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    return bearer.slice(7).trim();
  }

  return request.headers.get("x-ops-token")?.trim() || "";
}

function parseMaxItems(request: NextRequest): number {
  const raw = request.nextUrl.searchParams.get("maxItems");
  if (!raw) {
    return 25;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 25;
  }

  return Math.min(parsed, 100);
}

async function handleProcessQueue(request: NextRequest): Promise<NextResponse> {
  const expectedToken = process.env.OPS_CRON_TOKEN?.trim();
  if (!expectedToken) {
    return NextResponse.json(
      { ok: false, error: "OPS_CRON_TOKEN is missing." },
      { status: 503 }
    );
  }

  const providedToken = getTokenFromRequest(request);
  if (!providedToken || providedToken !== expectedToken) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const maxItems = parseMaxItems(request);
    const result = await processContactFallbackQueue({ maxItems });

    return NextResponse.json({
      ok: true,
      maxItems,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected queue processing error.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return handleProcessQueue(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleProcessQueue(request);
}

export function PUT(): NextResponse {
  return methodNotAllowed();
}

export function PATCH(): NextResponse {
  return methodNotAllowed();
}

export function DELETE(): NextResponse {
  return methodNotAllowed();
}

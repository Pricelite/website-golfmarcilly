import { NextResponse } from "next/server";

type JsonBody = Record<string, unknown>;

export function methodNotAllowed(
  allow: string,
  body: JsonBody = { ok: false, error: "Method not allowed" }
): NextResponse {
  return NextResponse.json(body, {
    status: 405,
    headers: { Allow: allow },
  });
}

export function invalidJsonBodyResponse(): NextResponse {
  return NextResponse.json(
    { ok: false, error: "Invalid JSON payload." },
    { status: 400 }
  );
}


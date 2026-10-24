import { NextRequest, NextResponse } from "next/server";
import { previewPathBlocked, validPreviewCredentials } from "@/lib/preview-access";

export function proxy(request: NextRequest) {
  if (process.env.PREVIEW_MODE !== "true") return NextResponse.next();
  const headers = { "X-Robots-Tag": "noindex, nofollow, noarchive", "Cache-Control": "private, no-store" };
  const password = process.env.PREVIEW_PASSWORD ?? "";
  if (password.length < 16) return NextResponse.json({ error: "Préversion non configurée." }, { status: 503, headers });
  if (request.nextUrl.pathname === "/_preview-health" && ["GET", "HEAD"].includes(request.method)) {
    return NextResponse.json({ status: "ok", mode: "preview" }, { headers });
  }
  if (!validPreviewCredentials(request.headers.get("authorization"), process.env.PREVIEW_USERNAME || "visiteur", password)) {
    return new NextResponse("Préversion privée — identifiants requis.", { status: 401, headers: { ...headers, "WWW-Authenticate": 'Basic realm="Golf de Marcilly - Preversion", charset="UTF-8"' } });
  }
  if (previewPathBlocked(request.nextUrl.pathname) || !["GET", "HEAD"].includes(request.method)) {
    return NextResponse.json({ ok: false, error: "Version de démonstration : les envois et l’administration sont désactivés." }, { status: 403, headers });
  }
  const response = NextResponse.next();
  for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
  return response;
}

export const config = { matcher: "/:path*" };

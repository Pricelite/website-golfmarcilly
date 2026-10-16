import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { readLimitedBytesBody } from "@/lib/api/request-body";
import { currentActor } from "@/lib/backoffice/auth";
import { audit, mediaDirectory, openDb, parseUserGrants, type MediaRow } from "@/lib/backoffice/db";
import { can } from "@/lib/backoffice/model";
import { hasTrustedOrigin } from "@/lib/security/request-guards";

export const runtime = "nodejs";
const denied = () => NextResponse.json({ error: "Accès refusé." }, { status: 403 });

export async function GET() {
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor || !can(parseUserGrants(actor), actor.role, "view", "media")) return denied();
    const media = db.prepare("SELECT id,filename,mime,size,created_at FROM media ORDER BY created_at DESC LIMIT 200").all() as MediaRow[];
    return NextResponse.json({ media });
  } finally { db.close(); }
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request.headers, { fallbackHost: new URL(request.url).host })) return denied();
  if (Number(request.headers.get("content-length")) > 6_000_000) return NextResponse.json({ error: "Fichier trop volumineux." }, { status: 413 });
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor || !can(parseUserGrants(actor), actor.role, "create", "media")) return denied();
    const body = await readLimitedBytesBody(request, 6_000_000);
    if (!body.ok) return NextResponse.json({ error: body.tooLarge ? "Fichier trop volumineux." : "Fichier invalide." }, { status: body.tooLarge ? 413 : 400 });
    let fields: FormData;
    try { fields = await new Request(request.url, { method: "POST", headers: { "Content-Type": request.headers.get("content-type") ?? "" }, body: Buffer.from(body.bytes) }).formData(); }
    catch { return NextResponse.json({ error: "Fichier invalide." }, { status: 400 }); }
    const file = fields.get("file");
    if (!(file instanceof File) || file.size < 1 || file.size > 5_000_000) return NextResponse.json({ error: "Image limitée à 5 Mo." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = sniff(bytes);
    if (!mime) return NextResponse.json({ error: "Formats acceptés : JPEG, PNG ou WebP." }, { status: 400 });
    const id = randomUUID();
    const name = file.name.replace(/[\x00-\x1f<>:"/\\|?*]/g, "").slice(0, 120) || "image";
    const directory = mediaDirectory();
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, id), bytes, { flag: "wx" });
    db.prepare("INSERT INTO media(id,filename,mime,size,created_by,created_at) VALUES(?,?,?,?,?,?)").run(id, name, mime, bytes.length, actor.id, new Date().toISOString());
    audit(db, actor.id, "media.create", id);
    return NextResponse.json({ media: { id, filename: name, mime, size: bytes.length } }, { status: 201 });
  } finally { db.close(); }
}

function sniff(bytes: Buffer): string | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "image/png";
  if (bytes.length > 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

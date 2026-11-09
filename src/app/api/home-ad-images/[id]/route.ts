import { readHomeAdImage } from "@/lib/home-ads-store";
import { adImageMime, validAdImageId } from "@/lib/home-ads-validation";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validAdImageId(id)) return new Response(null, { status: 404 });
  try {
    const bytes = await readHomeAdImage(id);
    const mime = bytes ? adImageMime(bytes) : null;
    if (!bytes || !mime) return new Response(null, { status: 404 });
    return new Response(Buffer.from(bytes), { headers: { "Content-Type": mime, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline", "X-Robots-Tag": "noindex" } });
  } catch { return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}

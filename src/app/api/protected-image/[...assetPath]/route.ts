import { readFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { sanitizeAssetPath } from "@/lib/protected-image-path";

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

function getMimeType(assetPath: string): string {
  const extension = path.extname(assetPath).toLowerCase();

  return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

type RouteContext = {
  params: Promise<{ assetPath?: string[] }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { assetPath } = await context.params;
  const sanitizedPath = sanitizeAssetPath(assetPath);

  if (!sanitizedPath) {
    return NextResponse.json(
      { error: "Invalid image source." },
      { status: 400 }
    );
  }

  const publicRoot = path.resolve(process.cwd(), "public");
  const filePath = path.resolve(publicRoot, sanitizedPath);
  if (!filePath.startsWith(`${publicRoot}${path.sep}`)) {
    return NextResponse.json({ error: "Invalid image source." }, { status: 400 });
  }

  try {
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": getMimeType(sanitizedPath),
        "Cache-Control":
          "public, max-age=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noimageindex, noarchive",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }
}

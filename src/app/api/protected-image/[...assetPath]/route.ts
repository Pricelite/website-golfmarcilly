import { readFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

function isValidPathSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("\\") &&
    !segment.includes("\0")
  );
}

function sanitizeAssetPath(assetPath: string[] | undefined): string | null {
  if (!assetPath || assetPath.length === 0) {
    return null;
  }

  const decodedSegments: string[] = [];

  for (const segment of assetPath) {
    let decoded = "";

    try {
      decoded = decodeURIComponent(segment.trim());
    } catch {
      return null;
    }

    if (!isValidPathSegment(decoded)) {
      return null;
    }

    decodedSegments.push(decoded);
  }

  const joined = decodedSegments.join("/");
  const extension = path.extname(joined).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return null;
  }

  return joined;
}

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

  const filePath = path.join(process.cwd(), "public", sanitizedPath);

  try {
    const buffer = await readFile(filePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": getMimeType(sanitizedPath),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noimageindex, noarchive",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }
}

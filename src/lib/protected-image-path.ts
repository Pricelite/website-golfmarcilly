import path from "path";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

function isValidPathSegment(segment: string): boolean {
  return (
    segment.length > 0 &&
    segment !== "." &&
    segment !== ".." &&
    !segment.includes("/") &&
    !segment.includes("\\") &&
    !segment.includes("\0")
  );
}

export function sanitizeAssetPath(assetPath: string[] | undefined): string | null {
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

const PROTECTED_IMAGE_ROUTE = "/api/protected-image";

export function toProtectedImageSrc(sourcePath: string): string {
  const normalizedPath = sourcePath.startsWith("/")
    ? sourcePath
    : `/${sourcePath}`;
  const encodedSegments = normalizedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${PROTECTED_IMAGE_ROUTE}/${encodedSegments}`;
}

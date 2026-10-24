import { createHash, timingSafeEqual } from "node:crypto";

export function validPreviewCredentials(header: string | null, username: string, password: string): boolean {
  if (password.length < 16 || !header || header.length > 4096 || !/^Basic /i.test(header)) return false;
  const supplied = Buffer.from(header.slice(6), "base64").toString("utf8");
  const hash = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(supplied), hash(`${username}:${password}`));
}

export function previewPathBlocked(pathname: string): boolean {
  return /^\/(?:admin|api\/(?:admin|backoffice|ops|health))(?:\/|$)/.test(pathname);
}

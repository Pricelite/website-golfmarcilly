type OriginOptions = {
  siteUrl?: string;
  additionalOrigins?: string;
  fallbackHost?: string;
  development?: boolean;
};

function parseOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.origin : null;
  } catch {
    return null;
  }
}

export function isTrustedRequestOrigin(headers: Headers, options: OriginOptions): boolean {
  const allowed = new Set(
    [options.siteUrl ?? "", ...(options.additionalOrigins ?? "").split(",")]
      .map((value) => parseOrigin(value.trim()))
      .filter((value): value is string => value !== null),
  );

  // Only local development may use the request host instead of the public URL.
  if (options.development && options.fallbackHost) {
    const local = parseOrigin(`http://${options.fallbackHost}`);
    if (local && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(local).hostname)) {
      allowed.add(local);
    }
  }

  if (allowed.size === 0) return false;
  const origin = headers.get("origin");
  const referer = headers.get("referer");
  if (!origin && !referer) return false;
  return [origin, referer].every((value) =>
    value === null || allowed.has(parseOrigin(value) ?? ""),
  );
}

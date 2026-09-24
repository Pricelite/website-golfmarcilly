type JsonBodyReadResult<T> =
  | { ok: true; data: T }
  | { ok: false };

export async function readJsonBody<T = unknown>(
  request: Request
): Promise<JsonBodyReadResult<T>> {
  try {
    const data: unknown = await request.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false };
    }
    return {
      ok: true,
      data: data as T,
    };
  } catch {
    return { ok: false };
  }
}

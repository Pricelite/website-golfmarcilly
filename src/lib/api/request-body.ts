type JsonBodyReadResult<T> =
  | { ok: true; data: T }
  | { ok: false };

export async function readJsonBody<T = unknown>(
  request: Request
): Promise<JsonBodyReadResult<T>> {
  try {
    return {
      ok: true,
      data: (await request.json()) as T,
    };
  } catch {
    return { ok: false };
  }
}


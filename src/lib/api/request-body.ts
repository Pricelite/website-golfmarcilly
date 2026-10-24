export const MAX_PUBLIC_JSON_BYTES = 16_384;

type BytesBodyReadResult =
  | { ok: true; bytes: Uint8Array }
  | { ok: false; tooLarge: boolean };

export async function readLimitedBytesBody(
  request: Request,
  maxBytes = MAX_PUBLIC_JSON_BYTES,
): Promise<BytesBodyReadResult> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > maxBytes) {
    return { ok: false, tooLarge: true };
  }
  if (!request.body) return { ok: false, tooLarge: false };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        void reader.cancel().catch(() => {});
        return { ok: false, tooLarge: true };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { ok: true, bytes };
  } catch {
    return { ok: false, tooLarge: false };
  }
}

type TextBodyReadResult =
  | { ok: true; text: string }
  | { ok: false; tooLarge: boolean };

export async function readLimitedTextBody(request: Request, maxBytes = MAX_PUBLIC_JSON_BYTES): Promise<TextBodyReadResult> {
  const body = await readLimitedBytesBody(request, maxBytes);
  if (!body.ok) return body;
  try { return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(body.bytes) }; }
  catch { return { ok: false, tooLarge: false }; }
}

type JsonBodyReadResult<T> =
  | { ok: true; data: T }
  | { ok: false; tooLarge: boolean };

export async function readJsonBody<T = unknown>(
  request: Request,
  maxBytes = MAX_PUBLIC_JSON_BYTES,
): Promise<JsonBodyReadResult<T>> {
  const body = await readLimitedTextBody(request, maxBytes);
  if (!body.ok) return body;
  try {
    const data: unknown = JSON.parse(body.text);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, tooLarge: false };
    }
    return {
      ok: true,
      data: data as T,
    };
  } catch {
    return { ok: false, tooLarge: false };
  }
}

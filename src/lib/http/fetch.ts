const DEFAULT_TIMEOUT_MS = 10_000;

type FetchWithTimeoutOptions = RequestInit & {
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  retryOnStatuses?: number[];
};

function sleep(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

function createTimeoutSignal(
  timeoutMs: number,
  signal?: AbortSignal | null
): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
}

export async function fetchWithTimeout(
  input: string | URL | Request,
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryCount = 0,
    retryDelayMs = 250,
    retryOnStatuses = [429, 500, 502, 503, 504],
    signal,
    ...init
  } = options;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const response = await fetch(input, {
        ...init,
        signal: createTimeoutSignal(timeoutMs, signal),
      });

      if (
        attempt < retryCount &&
        retryOnStatuses.includes(response.status)
      ) {
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      if (attempt >= retryCount) {
        throw error;
      }

      await sleep(retryDelayMs * (attempt + 1));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Fetch request failed.");
}

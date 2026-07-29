export function logApiError(
  route: string,
  event: string,
  details: Record<string, unknown>
): void {
  console.error(`[${route}] ${event}`, details);
}


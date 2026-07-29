const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseTrimmedString(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function isWithinLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

export function isNonEmptyWithinLength(
  value: string,
  maxLength: number
): boolean {
  return value.length > 0 && value.length <= maxLength;
}


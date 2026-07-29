export const ADMIN_SESSION_COOKIE_NAME = "initiation_admin_session";
const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const ADMIN_SESSION_VERSION = 1;

type AdminSessionPayload = {
  v: number;
  sub: "initiation-admin";
  iat: number;
  exp: number;
  nonce: string;
};

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function getAdminPasswordOrThrow(): string {
  const value = process.env.ADMIN_PASSWORD?.trim();
  if (!value) {
    throw new Error("Missing required env var: ADMIN_PASSWORD");
  }

  return value;
}

function getAdminSessionSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() || getAdminPasswordOrThrow()
  );
}

function bytesToHex(value: Uint8Array): string {
  return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64UrlEncodeBytes(value: Uint8Array): string {
  const binary = Array.from(value, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlEncodeString(value: string): string {
  return base64UrlEncodeBytes(textEncoder.encode(value));
}

function base64UrlDecodeBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function toArrayBuffer(value: Uint8Array): ArrayBuffer {
  return value.buffer.slice(
    value.byteOffset,
    value.byteOffset + value.byteLength
  ) as ArrayBuffer;
}

async function createLegacyAdminSessionToken(password: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(`initiation-admin:${password}`)
  );

  return bytesToHex(new Uint8Array(digest));
}

export async function getExpectedLegacyAdminSessionToken(): Promise<string> {
  return createLegacyAdminSessionToken(getAdminPasswordOrThrow());
}

async function importAdminSessionKey(
  usages: KeyUsage[]
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getAdminSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
}

async function signSessionPayload(value: string): Promise<string> {
  const key = await importAdminSessionKey(["sign"]);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(value)
  );

  return base64UrlEncodeBytes(new Uint8Array(signature));
}

function parseSessionPayload(value: string): AdminSessionPayload | null {
  try {
    const decoded = textDecoder.decode(base64UrlDecodeBytes(value));
    const parsed = JSON.parse(decoded) as Partial<AdminSessionPayload>;

    if (
      parsed?.v !== ADMIN_SESSION_VERSION ||
      parsed.sub !== "initiation-admin" ||
      !Number.isInteger(parsed.iat) ||
      !Number.isInteger(parsed.exp) ||
      typeof parsed.nonce !== "string" ||
      parsed.nonce.length < 16
    ) {
      return null;
    }

    return parsed as AdminSessionPayload;
  } catch {
    return null;
  }
}

function buildSessionPayload(): AdminSessionPayload {
  const issuedAt = Math.floor(Date.now() / 1000);

  return {
    v: ADMIN_SESSION_VERSION,
    sub: "initiation-admin",
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS,
    nonce: crypto.randomUUID(),
  };
}

export async function createAdminSessionToken(password: string): Promise<string> {
  if (!password) {
    throw new Error("Admin password is required to create a session.");
  }

  const payload = buildSessionPayload();
  const encodedPayload = base64UrlEncodeString(JSON.stringify(payload));
  const signature = await signSessionPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

async function isSignedAdminSessionTokenValid(token: string): Promise<boolean> {
  const [encodedPayload, signature] = token.split(".", 2);
  if (!encodedPayload || !signature) {
    return false;
  }

  const payload = parseSessionPayload(encodedPayload);
  if (!payload || payload.exp <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  try {
    const key = await importAdminSessionKey(["verify"]);
    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      toArrayBuffer(base64UrlDecodeBytes(signature)),
      textEncoder.encode(encodedPayload)
    );

    return verified;
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(
  cookiesStore: CookieReader
): Promise<boolean> {
  const currentToken = cookiesStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!currentToken) {
    return false;
  }

  if (await isSignedAdminSessionTokenValid(currentToken)) {
    return true;
  }

  return currentToken === (await getExpectedLegacyAdminSessionToken());
}

export function getAdminSessionMaxAgeSeconds(): number {
  return ADMIN_SESSION_MAX_AGE_SECONDS;
}

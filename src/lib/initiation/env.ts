import "server-only";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getAdminPassword(): string {
  return getRequiredEnv("ADMIN_PASSWORD");
}


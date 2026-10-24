import { dirname, resolve } from "node:path";

export function resolveMediaPath(directory: string, id: string): string | null {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)) return null;
  const root = resolve(directory);
  const file = resolve(root, id);
  return dirname(file) === root ? file : null;
}

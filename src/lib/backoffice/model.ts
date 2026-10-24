export const contentActions = ["view", "create", "edit", "delete", "submit", "publish", "restore"] as const;
export type ContentAction = (typeof contentActions)[number];
export type Role = "admin" | "editor" | "contributor";
export type Grant = { resource: string; actions: ContentAction[] };

export type Block =
  | { id: string; type: "heading"; text: string; level: 2 | 3 }
  | { id: string; type: "text"; text: string }
  | { id: string; type: "image"; mediaId: string; alt: string }
  | { id: string; type: "button"; text: string; href: string };

export type PageContent = {
  title: string;
  seoTitle: string;
  seoDescription: string;
  theme: "cream" | "green" | "white";
  blocks: Block[];
};

export function can(grants: Grant[], role: Role, action: ContentAction, resource: string): boolean {
  if (role === "admin") return true;
  return grants.some(grant => (grant.resource === "*" || grant.resource === resource ||
    (grant.resource === "pages" && resource.startsWith("page:"))) && grant.actions.includes(action));
}

export function grantCreatedPage(grants: Grant[], role: Role, id: string): Grant[] {
  if (role === "admin") return grants;
  const resource = `page:${id}`;
  const missing = (["view", "edit"] as const).filter(action => !can(grants, role, action, resource));
  return missing.length ? [...grants, { resource, actions: missing }] : grants;
}

export function parseGrants(input: unknown): Grant[] | null {
  if (!Array.isArray(input) || input.length > 100) return null;
  const grants: Grant[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") return null;
    const value = item as Record<string, unknown>;
    if (typeof value.resource !== "string" || !/^(\*|pages|media|page:[a-f0-9-]{36})$/.test(value.resource)) return null;
    if (!Array.isArray(value.actions) || value.actions.length > contentActions.length ||
      !value.actions.every(action => contentActions.includes(action as ContentAction))) return null;
    grants.push({ resource: value.resource, actions: [...new Set(value.actions)] as ContentAction[] });
  }
  return grants;
}

export function parsePageContent(input: unknown): PageContent | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;
  if (typeof value.title !== "string" || !value.title.trim() || value.title.length > 120 ||
      typeof value.seoTitle !== "string" || value.seoTitle.length > 120 ||
      typeof value.seoDescription !== "string" || value.seoDescription.length > 320 ||
      !["cream", "green", "white"].includes(value.theme as string) ||
      !Array.isArray(value.blocks) || value.blocks.length > 40) return null;
  const ids = new Set<string>();
  const blocks: Block[] = [];
  for (const raw of value.blocks) {
    if (!raw || typeof raw !== "object") return null;
    const block = raw as Record<string, unknown>;
    if (typeof block.id !== "string" || !/^[a-f0-9-]{36}$/.test(block.id) || ids.has(block.id)) return null;
    ids.add(block.id);
    if (block.type === "heading" && typeof block.text === "string" && block.text.length <= 200 && (block.level === 2 || block.level === 3)) {
      blocks.push({ id: block.id, type: "heading", text: block.text, level: block.level });
    } else if (block.type === "text" && typeof block.text === "string" && block.text.length <= 6000) {
      blocks.push({ id: block.id, type: "text", text: block.text });
    } else if (block.type === "image" && typeof block.mediaId === "string" && /^[a-f0-9-]{36}$/.test(block.mediaId) && typeof block.alt === "string" && block.alt.length <= 240) {
      blocks.push({ id: block.id, type: "image", mediaId: block.mediaId, alt: block.alt });
    } else if (block.type === "button" && typeof block.text === "string" && block.text.length <= 100 && typeof block.href === "string" && isSafeHref(block.href)) {
      blocks.push({ id: block.id, type: "button", text: block.text, href: block.href });
    } else return null;
  }
  return { title: value.title.trim(), seoTitle: value.seoTitle.trim(), seoDescription: value.seoDescription.trim(), theme: value.theme as PageContent["theme"], blocks };
}

export function isSafeHref(href: string): boolean {
  if (href.length > 500 || !href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try { return new URL(href).protocol === "https:"; } catch { return false; }
}

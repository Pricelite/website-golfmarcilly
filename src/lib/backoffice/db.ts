import "server-only";

import { mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { grantCreatedPage, type Grant, type PageContent, type Role } from "./model";

type Statement = { get(...params: unknown[]): unknown; all(...params: unknown[]): unknown[]; run(...params: unknown[]): { changes: number } };
export type Db = { exec(sql: string): void; prepare(sql: string): Statement; close(): void };

export type UserRow = { id: string; email: string; name: string; password_hash: string; role: Role; grants_json: string; active: number; created_at: string; updated_at: string };
export type PageRow = { id: string; slug: string; draft_json: string; published_json: string | null; draft_revision: number; published_revision: number | null; review_requested: number; created_at: string; updated_at: string };
export type MediaRow = { id: string; filename: string; mime: string; size: number; created_by: string; created_at: string };

export function dbPath(): string {
  const configured = process.env.BACKOFFICE_DB_PATH?.trim();
  if (!configured && process.env.NODE_ENV === "production") throw new Error("BACKOFFICE_DB_PATH is required in production");
  if (configured && process.env.NODE_ENV === "production" && !isAbsolute(configured)) throw new Error("BACKOFFICE_DB_PATH must be absolute in production");
  const path = configured ? resolve(configured) : join(process.cwd(), ".data", "backoffice.sqlite");
  const publicRoot = resolve(process.cwd(), "public");
  if (path === publicRoot || path.startsWith(publicRoot + sep)) throw new Error("Back-office database cannot be public");
  const temporaryRoot = resolve(tmpdir());
  if (process.env.NODE_ENV === "production" && process.env.PREVIEW_MODE !== "true" &&
    (path === temporaryRoot || path.startsWith(temporaryRoot + sep))) {
    throw new Error("Back-office database requires persistent storage in production");
  }
  return path;
}

export function mediaDirectory(): string { return join(dirname(dbPath()), "media"); }

export function openDb(): Db {
  const path = dbPath();
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
  db.exec(readFileSync(join(process.cwd(), "src", "lib", "backoffice", "schema.sql"), "utf8"));
  return db;
}

export function getUser(db: Db, id: string): UserRow | undefined { return db.prepare("SELECT * FROM users WHERE id=?").get(id) as UserRow | undefined; }
export function getPage(db: Db, id: string): PageRow | undefined { return db.prepare("SELECT * FROM pages WHERE id=?").get(id) as PageRow | undefined; }
export function listPages(db: Db): PageRow[] { return db.prepare("SELECT * FROM pages ORDER BY updated_at DESC").all() as PageRow[]; }
export function audit(db: Db, actor: string | null, action: string, target: string): void {
  db.prepare("INSERT INTO audit(actor_id,action,target,created_at) VALUES(?,?,?,?)").run(actor, action, target, new Date().toISOString());
}

export function createPage(db: Db, slug: string, content: PageContent, actor: string): PageRow {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("INSERT INTO pages(id,slug,draft_json,created_at,updated_at) VALUES(?,?,?,?,?)").run(id, slug, JSON.stringify(content), now, now);
    const creator = getUser(db, actor)!;
    const previousGrants = parseUserGrants(creator);
    const grants = grantCreatedPage(previousGrants, creator.role, id);
    if (grants !== previousGrants) {
      db.prepare("UPDATE users SET grants_json=?,updated_at=? WHERE id=?").run(JSON.stringify(grants), now, actor);
    }
    db.prepare("INSERT INTO revisions(id,page_id,revision,content_json,action,actor_id,created_at) VALUES(?,?,?,?,?,?,?)").run(crypto.randomUUID(), id, 1, JSON.stringify(content), "create", actor, now);
    audit(db, actor, "page.create", id);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return getPage(db, id)!;
}

export function updateDraft(db: Db, page: PageRow, content: PageContent, expectedRevision: number, actor: string, action: "edit" | "restore" = "edit"): PageRow | null {
  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    const changed = db.prepare("UPDATE pages SET draft_json=?, draft_revision=draft_revision+1, review_requested=0, updated_at=? WHERE id=? AND draft_revision=?")
      .run(JSON.stringify(content), now, page.id, expectedRevision).changes;
    if (!changed) { db.exec("ROLLBACK"); return null; }
    db.prepare("INSERT INTO revisions(id,page_id,revision,content_json,action,actor_id,created_at) VALUES(?,?,?,?,?,?,?)").run(crypto.randomUUID(), page.id, expectedRevision + 1, JSON.stringify(content), action, actor, now);
    audit(db, actor, `page.${action}`, page.id);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return getPage(db, page.id)!;
}

export function publishPage(db: Db, page: PageRow, expectedRevision: number, actor: string): PageRow | null {
  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    const changed = db.prepare("UPDATE pages SET published_json=draft_json,published_revision=draft_revision,review_requested=0,updated_at=? WHERE id=? AND draft_revision=?")
      .run(now, page.id, expectedRevision).changes;
    if (!changed) { db.exec("ROLLBACK"); return null; }
    audit(db, actor, "page.publish", page.id);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
  return getPage(db, page.id)!;
}

export function parseUserGrants(user: UserRow): Grant[] {
  try { return JSON.parse(user.grants_json) as Grant[]; } catch { return []; }
}

import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { unstable_cache } from "next/cache";
import { defaultManagedHomeAds, type ManagedHomeAd } from "@/data/home-ads";
import { adImageMime, parseManagedHomeAd, validAdImageId, validHomeAdId } from "./home-ads-validation";
import { createContentAdminClient, localContentStoreEnabled } from "./supabase/content";

const bucket = "golf-home-ads";
const directory = join(process.cwd(), ".data", "home-ads");
export const homeAdsCacheTag = "managed-home-ads";
export const MAX_MANAGED_ADS = 60;

function storedAd(value: unknown): ManagedHomeAd {
  const parsed = parseManagedHomeAd(value);
  const id = value && typeof value === "object" ? (value as { id?: unknown }).id : null;
  if (!parsed.ok || !validHomeAdId(id)) throw new Error("Invalid ad record");
  return { ...parsed.ad, id };
}
function mergeDefaults(records: ManagedHomeAd[]) {
  const merged = new Map(defaultManagedHomeAds().map(ad => [ad.id, ad]));
  for (const ad of records) merged.set(ad.id, ad);
  return [...merged.values()].sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));
}

export async function listManagedHomeAds(): Promise<ManagedHomeAd[]> {
  if (localContentStoreEnabled()) {
    let files: string[];
    try { files = await readdir(join(directory, "records")); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return defaultManagedHomeAds(); throw error; }
    const records = await Promise.all(files.filter(name => name.endsWith(".json") && validHomeAdId(name.slice(0, -5))).map(async name => storedAd(JSON.parse(await readFile(join(directory, "records", name), "utf8")))));
    return mergeDefaults(records);
  }
  const client = createContentAdminClient();
  const { data: info, error: bucketError } = await client.storage.getBucket(bucket);
  if (bucketError) {
    if (String(bucketError.statusCode) === "404") return defaultManagedHomeAds();
    throw bucketError;
  }
  if (!info || info.public) throw new Error("Ad storage must be private");
  const { data, error } = await client.storage.from(bucket).list("records", { limit: MAX_MANAGED_ADS + 1 });
  if (error) throw error;
  const records = await Promise.all((data ?? []).filter(file => file.name.endsWith(".json") && validHomeAdId(file.name.slice(0, -5))).map(async file => {
    const { data: blob, error } = await client.storage.from(bucket).download(`records/${file.name}`);
    if (error || !blob || blob.size > 16_384) throw error ?? new Error("Invalid ad record");
    const record = storedAd(JSON.parse(await blob.text()));
    if (`${record.id}.json` !== file.name) throw new Error("Ad identifier mismatch");
    return record;
  }));
  return mergeDefaults(records);
}

// No cookies or request data in the shared cache. Mutations expire this tag immediately.
const cachedAds = unstable_cache(listManagedHomeAds, ["home-ads-v1"], { revalidate: 60, tags: [homeAdsCacheTag] });
export async function publicHomeAds(): Promise<ManagedHomeAd[]> {
  if (process.env.PREVIEW_MODE === "true") return defaultManagedHomeAds();
  try { return localContentStoreEnabled() ? await listManagedHomeAds() : await cachedAds(); }
  catch { return []; } // Never resurrect a disabled announcement when its current state cannot be read.
}

async function ensureStorage() {
  if (localContentStoreEnabled()) {
    await mkdir(join(directory, "records"), { recursive: true });
    await mkdir(join(directory, "images"), { recursive: true });
    return;
  }
  const client = createContentAdminClient();
  const { data, error } = await client.storage.getBucket(bucket);
  if (data) { if (data.public) throw new Error("Ad storage must be private"); return; }
  if (error && String(error.statusCode) !== "404") throw error;
  const { error: created } = await client.storage.createBucket(bucket, { public: false, fileSizeLimit: 6_000_000, allowedMimeTypes: ["application/json", "image/jpeg", "image/png", "image/webp"] });
  if (created) { const existing = await client.storage.getBucket(bucket); if (existing.error || !existing.data || existing.data.public) throw created; }
}

export async function saveManagedHomeAd(ad: ManagedHomeAd, imageBytes?: Uint8Array): Promise<ManagedHomeAd> {
  await ensureStorage();
  const current = await listManagedHomeAds();
  if (current.length >= MAX_MANAGED_ADS && !current.some(item => item.id === ad.id)) throw new Error("Too many ads");
  let saved = ad;
  if (imageBytes) {
    const mime = adImageMime(imageBytes);
    if (!mime) throw new Error("Invalid image");
    const id = randomUUID();
    if (localContentStoreEnabled()) await writeFile(join(directory, "images", id), imageBytes, { flag: "wx" });
    else {
      const { error } = await createContentAdminClient().storage.from(bucket).upload(`images/${id}`, imageBytes, { contentType: mime, upsert: false, cacheControl: "31536000" });
      if (error) throw error;
    }
    saved = { ...ad, image: `/api/home-ad-images/${id}` };
  }
  if (localContentStoreEnabled()) {
    const file = join(directory, "records", `${saved.id}.json`);
    const temporary = `${file}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(saved), "utf8");
    await rename(temporary, file);
  } else {
    const { error } = await createContentAdminClient().storage.from(bucket).upload(`records/${saved.id}.json`, JSON.stringify(saved), { contentType: "application/json", upsert: true, cacheControl: "0" });
    if (error) throw error;
  }
  return saved;
}

export async function readHomeAdImage(id: string): Promise<Uint8Array | null> {
  if (!validAdImageId(id)) return null;
  if (localContentStoreEnabled()) {
    try { return new Uint8Array(await readFile(join(directory, "images", id))); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  }
  const { data, error } = await createContentAdminClient().storage.from(bucket).download(`images/${id}`);
  if (error) { if ([400,404].includes(Number(error.statusCode))) return null; throw error; }
  return data ? new Uint8Array(await data.arrayBuffer()) : null;
}

import sharp from "sharp";
import { adImageMime, MAX_AD_IMAGE_BYTES } from "./home-ads-validation";

export async function prepareHomeAdImage(bytes: Uint8Array): Promise<Uint8Array> {
  if (!adImageMime(bytes)) throw new Error("Invalid image format");
  const image = sharp(bytes, { limitInputPixels: 40_000_000, failOn: "error" });
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height || (metadata.pages ?? 1) > 1) throw new Error("Invalid image dimensions");
  const result = await image.rotate().resize({ width: 2000, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
  if (result.length > MAX_AD_IMAGE_BYTES) throw new Error("Image too large");
  return result;
}

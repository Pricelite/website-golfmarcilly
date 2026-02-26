import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

const ROUTES = [
  "",
  "/contact",
  "/debutants",
  "/initiation/reservation",
  "/restaurant",
  "/enseignement",
  "/tarifs",
  "/association-sportive",
  "/academie",
  "/vie-du-club",
  "/mentions-legales",
  "/politique-de-confidentialite",
  "/politique-cookies",
] as const;

function getLastModifiedDate(): Date | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_LASTMOD?.trim();
  if (!raw) {
    return undefined;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = getLastModifiedDate();

  return ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}

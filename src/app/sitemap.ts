import type { MetadataRoute } from "next";

import { posts } from "@/data/posts";
import { getActiveSiteOffers } from "@/data/offers";
import { legalContent } from "@/data/legal";
import { siteConfig } from "@/data/site";
import { listPages, openDb } from "@/lib/backoffice/db";

export const revalidate = 60;

export default function sitemap(): MetadataRoute.Sitemap {
  let managedPages: { slug: string; updated_at: string }[] = [];
  if (process.env.NODE_ENV !== "production" || process.env.BACKOFFICE_DB_PATH) {
    try {
      const db = openDb();
      try { managedPages = listPages(db).filter(page => Boolean(page.published_json)); }
      finally { db.close(); }
    } catch { /* The existing sitemap remains available if the optional content store is unavailable. */ }
  }
  const staticPages = [
    "/",
    "/golf",
    "/tarifs",
    "/enseignement",
    "/restaurant",
    "/evenements",
    "/actualites",
    "/contact",
    "/association-sportive",
    "/academie",
    "/partenaires",
    "/je-debute-le-golf",
    "/reserver-un-cours",
    ...(legalContent.reviewed ? ["/mentions-legales", "/politique-de-confidentialite"] : []),
  ];

  return [
    ...staticPages.map((path) => ({
      url: new URL(path, siteConfig.url).toString(),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...posts.map((post) => ({
      url: new URL(`/actualites/${post.slug}`, siteConfig.url).toString(),
      lastModified: post.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...getActiveSiteOffers().map((offer) => ({
      url: new URL(`/offres/${offer.slug}`, siteConfig.url).toString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...managedPages.map((page) => ({
      url: new URL(`/pages/${page.slug}`, siteConfig.url).toString(),
      lastModified: page.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}

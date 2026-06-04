import type { MetadataRoute } from "next";

import { posts } from "@/data/posts";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "/",
    "/golf",
    "/tarifs",
    "/enseignement",
    "/restaurant",
    "/evenements",
    "/actualites",
    "/contact",
    "/mentions-legales",
    "/politique-de-confidentialite",
  ];

  return [
    ...staticPages.map((path) => ({
      url: new URL(path, siteConfig.url).toString(),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...posts.map((post) => ({
      url: new URL(`/actualites/${post.slug}`, siteConfig.url).toString(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}

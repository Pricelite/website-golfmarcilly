import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

const ROUTES = [
  "",
  "/contact",
  "/restaurant",
  "/enseignement",
  "/association-sportive",
  "/association-sportive/competitions",
  "/association-sportive/classements",
  "/association-sportive/adhesion",
  "/academie",
  "/vie-du-club",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}

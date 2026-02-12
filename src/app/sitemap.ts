import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

const ROUTES = [
  "",
  "/contact",
  "/restaurant",
  "/enseignement",
  "/enseignement/cours-individuels",
  "/enseignement/stages",
  "/enseignement/ecole-de-golf",
  "/association-sportive",
  "/association-sportive/competitions",
  "/association-sportive/classements",
  "/association-sportive/adhesion",
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

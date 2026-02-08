import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

const ROUTES = [
  "",
  "/contact",
  "/restaurant",
  "/restaurant/carte-menus",
  "/restaurant/horaires",
  "/restaurant/reservation",
  "/enseignement",
  "/enseignement/cours-individuels",
  "/enseignement/stages",
  "/enseignement/ecole-de-golf",
  "/association-sportive",
  "/association-sportive/competitions",
  "/association-sportive/classements",
  "/association-sportive/adhesion",
  "/vie-du-club",
  "/vie-du-club/actualites",
  "/vie-du-club/evenements",
  "/vie-du-club/galerie",
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

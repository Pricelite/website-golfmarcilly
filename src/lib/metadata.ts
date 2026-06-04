import type { Metadata } from "next";

import { siteConfig } from "@/data/site";

const defaultKeywords = [
  "Golf Orleans",
  "Golf Loiret",
  "Golf pres d'Orleans",
  "Green fee Orleans",
  "Restaurant golf Orleans",
  "Cours de golf Orleans",
  "Seminaire golf Orleans",
  "Initiation golf Loiret",
];

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  image?: string;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  image = "/images/club-house-marcilly.png",
}: MetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = `${title} | ${siteConfig.name}`;

  return {
    title: fullTitle,
    description,
    keywords: [...defaultKeywords, ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: absoluteUrl(image),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

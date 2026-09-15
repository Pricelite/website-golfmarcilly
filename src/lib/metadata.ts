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
  indexable?: boolean;
  type?: "website" | "article";
};

export function buildMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  image = "/images/club-house-marcilly.png",
  indexable = true,
  type = "website",
}: MetadataInput): Metadata {
  const url = absoluteUrl(path);
  const socialTitle = `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    keywords: [...defaultKeywords, ...keywords],
    robots: { index: indexable, follow: true },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: "fr_FR",
      type,
      images: [
        {
          url: absoluteUrl(image),
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

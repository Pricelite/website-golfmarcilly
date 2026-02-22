import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  getMetadataBase,
} from "@/lib/site";
import { toProtectedImageSrc } from "@/lib/protected-image";
import ImageProtection from "@/components/image-protection";
import AnnouncementMarquee from "@/components/announcement-marquee";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const metadataBase = getMetadataBase();

export const metadata: Metadata = {
  metadataBase,
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
    },
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    type: "website",
    images: [
      {
        url: toProtectedImageSrc("/images/clubhouse.png"),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [toProtectedImageSrc("/images/clubhouse.png")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} antialiased`}
      >
        <ImageProtection />
        <a
          href="#content-start"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-full focus:bg-emerald-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-emerald-50"
        >
          Aller au contenu principal
        </a>
        <div className="sticky top-0 z-30">
          <SiteHeader />
          <AnnouncementMarquee />
        </div>
        <div id="content-start" tabIndex={-1} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

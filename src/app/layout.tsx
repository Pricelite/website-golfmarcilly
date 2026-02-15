import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { getSupabaseEnv } from "@/lib/env";
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
        url: toProtectedImageSrc("/images/club-house-marcilly.png"),
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
    images: [toProtectedImageSrc("/images/club-house-marcilly.png")],
  },
  alternates: {
    canonical: "/",
  },
};

getSupabaseEnv();

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
        <div className="sticky top-0 z-30">
          <SiteHeader />
          <AnnouncementMarquee />
        </div>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

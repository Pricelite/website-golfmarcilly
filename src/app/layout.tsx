import type { Metadata } from "next";

import { AnalyticsTracker } from "@/components/analytics/tracker";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileActions } from "@/components/layout/mobile-actions";
import { JsonLd } from "@/components/ui/json-ld";
import { siteConfig } from "@/data/site";
import { absoluteUrl } from "@/lib/metadata";
import { buildOrganizationSchema } from "@/lib/schema";
import "./globals.css";
import "../../styles/prose.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: absoluteUrl("/images/club-house-marcilly-og.jpg"),
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [absoluteUrl("/images/club-house-marcilly-og.jpg")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className="pb-[calc(6rem+env(safe-area-inset-bottom))] text-emerald-950 antialiased lg:pb-0">
        <JsonLd data={buildOrganizationSchema()} />
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-emerald-950 focus:px-4 focus:py-2 focus:text-stone-50"
          href="#main-content"
        >
          Aller au contenu
        </a>
        <Header />
        {process.env.PREVIEW_MODE === "true" ? <aside className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm leading-6 text-emerald-950">
          <strong>Préversion privée — démonstration uniquement.</strong> Les envois et l’administration sont désactivés. Les créneaux et la carte sont des exemples. Les liens externes ouvrent les services réels.
        </aside> : null}
        <main id="main-content">{children}</main>
        <Footer />
        <MobileActions />
        <AnalyticsTracker />
      </body>
    </html>
  );
}

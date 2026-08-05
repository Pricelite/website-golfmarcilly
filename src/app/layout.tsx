import type { Metadata } from "next";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
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
        url: absoluteUrl("/images/club-house-marcilly.png"),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [absoluteUrl("/images/club-house-marcilly.png")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body className="bg-stone-50 text-emerald-950 antialiased">
        <JsonLd data={buildOrganizationSchema()} />
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-emerald-950 focus:px-4 focus:py-2 focus:text-stone-50"
          href="#main-content"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <div className="fixed inset-x-0 bottom-3 z-40 px-4 lg:hidden">
          <div className="mx-auto flex max-w-md items-center gap-3 rounded-full border border-emerald-950/10 bg-white/95 p-2 shadow-lg shadow-emerald-950/15 backdrop-blur">
            <a
              className="flex-1 rounded-full border border-emerald-950/12 px-4 py-3 text-center text-sm font-semibold text-emerald-950"
              href={`tel:${siteConfig.phoneHref}`}
            >
              Appeler
            </a>
            <a
              className="flex-1 rounded-full bg-emerald-900 px-4 py-3 text-center text-sm font-semibold text-stone-50"
              href={siteConfig.reservationUrl}
            >
              Réserver
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

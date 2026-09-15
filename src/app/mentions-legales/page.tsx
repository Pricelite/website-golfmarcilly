import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { legalContent } from "@/data/legal";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Mentions légales",
  description: "Mentions légales du site du Golf de Marcilly.",
  path: "/mentions-legales",
  indexable: legalContent.reviewed,
});

export default function LegalPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Mentions légales", path: "/mentions-legales" },
        ])}
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle as="h1" eyebrow="Juridique" title="Mentions légales" />
        <div className="prose-brand mt-8">
          <section aria-labelledby="site-contact">
            <h2 id="site-contact">Contact du site</h2>
            <p>{siteConfig.name} — {siteConfig.addressLine1}, {siteConfig.addressLine2}.</p>
            <p><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> — <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>.</p>
          </section>
          {legalContent.publisherIdentity && (
            <section><h2>Éditeur</h2><p>{legalContent.publisherIdentity}</p></section>
          )}
          {legalContent.publicationDirector && (
            <section><h2>Direction de la publication</h2><p>{legalContent.publicationDirector}</p></section>
          )}
          {legalContent.hostingDetails && (
            <section><h2>Hébergement</h2><p>{legalContent.hostingDetails}</p></section>
          )}
        </div>
      </section>
    </>
  );
}

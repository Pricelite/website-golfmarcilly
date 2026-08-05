import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Mentions légales",
  description: "Mentions légales du site du Golf de Marcilly.",
  path: "/mentions-legales",
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
          <p>Éditeur du site : Golf de Marcilly, 829 domaine de la Plaine, 45240 Marcilly-en-Villette.</p>
          <p>Directeur de la publication : Direction du Golf de Marcilly.</p>
          <p>Hébergement : à compléter selon votre hébergeur de production.</p>
          <p>Contact : golf@marcilly.com - 02 38 76 11 73.</p>
        </div>
      </section>
    </>
  );
}

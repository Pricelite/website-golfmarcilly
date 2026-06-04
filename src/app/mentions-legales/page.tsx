import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Mentions legales",
  description: "Mentions legales du site du Golf de Marcilly.",
  path: "/mentions-legales",
});

export default function LegalPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Mentions legales", path: "/mentions-legales" },
        ])}
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Juridique"
          title="Mentions legales"
        />
        <div className="prose-brand mt-8">
          <p>Editeur du site : Golf de Marcilly, 829 domaine de la Plaine, 45240 Marcilly-en-Villette.</p>
          <p>Directeur de la publication : Direction du Golf de Marcilly.</p>
          <p>Hebergement : a completer selon votre hebergeur de production.</p>
          <p>Contact : golf@marcilly.com - 02 38 76 11 73.</p>
        </div>
      </section>
    </>
  );
}

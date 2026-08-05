import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Politique de confidentialité",
  description: "Politique de confidentialité du site du Golf de Marcilly.",
  path: "/politique-de-confidentialite",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Politique de confidentialité", path: "/politique-de-confidentialite" },
        ])}
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          as="h1"
          eyebrow="Données personnelles"
          title="Politique de confidentialité"
        />
        <div className="prose-brand mt-8">
          <p>
            Les informations transmises via les formulaires sont utilisées uniquement
            pour répondre à vos demandes commerciales ou organisationnelles.
          </p>
          <p>
            Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos
            données en écrivant à golf@marcilly.com.
          </p>
          <p>
            Cette page est prête à être complétée avec vos mentions RGPD finales
            avant mise en production.
          </p>
        </div>
      </section>
    </>
  );
}

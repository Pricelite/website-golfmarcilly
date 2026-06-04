import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Politique de confidentialite",
  description: "Politique de confidentialite du site du Golf de Marcilly.",
  path: "/politique-de-confidentialite",
});

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Politique de confidentialite", path: "/politique-de-confidentialite" },
        ])}
      />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Donnees personnelles"
          title="Politique de confidentialite"
        />
        <div className="prose-brand mt-8">
          <p>
            Les informations transmises via les formulaires sont utilisees uniquement
            pour repondre a vos demandes commerciales ou organisationnelles.
          </p>
          <p>
            Vous pouvez demander l&apos;acces, la rectification ou la suppression de vos
            donnees en ecrivant a golf@marcilly.com.
          </p>
          <p>
            Cette page est prete a etre completee avec vos mentions RGPD finales
            avant mise en production.
          </p>
        </div>
      </section>
    </>
  );
}

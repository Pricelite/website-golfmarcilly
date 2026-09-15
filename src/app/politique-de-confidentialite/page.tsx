import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { legalContent } from "@/data/legal";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Politique de confidentialité",
  description: "Politique de confidentialité du site du Golf de Marcilly.",
  path: "/politique-de-confidentialite",
  indexable: legalContent.reviewed,
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
          <h2>Informations transmises par les formulaires</h2>
          <p>
            Selon votre demande, les formulaires recueillent vos coordonnées,
            votre message et les informations utiles à son traitement : date,
            nombre de participants ou formule choisie.
          </p>
          <h2>Nous contacter au sujet de vos données</h2>
          <p>
            Pour toute question ou demande concernant vos données personnelles,
            écrivez à <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>
          {[
            ["Responsable des traitements", legalContent.dataController],
            ["Utilisation des données", legalContent.processingDetails],
            ["Destinataires", legalContent.recipientsDetails],
            ["Conservation", legalContent.retentionDetails],
            ["Vos droits", legalContent.rightsDetails],
            ["Services tiers", legalContent.thirdPartyDetails],
          ].map(([title, text]) => text ? (
            <section key={title}><h2>{title}</h2><p>{text}</p></section>
          ) : null)}
        </div>
      </section>
    </>
  );
}

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
          <p>
            Cette page décrit les traitements de données réalisés directement
            par le présent site. Les services externes ouverts à partir d’un lien
            disposent de leurs propres politiques de confidentialité.
          </p>
          <h2>Responsable du traitement</h2>
          <p>{legalContent.dataController}</p>
          <h2>Informations transmises par les formulaires</h2>
          <p>
            Selon votre demande, les formulaires recueillent vos coordonnées,
            votre message et les informations utiles à son traitement : date,
            nombre de participants ou formule choisie.
          </p>
          <p>{legalContent.processingDetails}</p>
          <p>
            Les champs signalés comme obligatoires sont nécessaires pour traiter
            la demande. À défaut, le site ne pourra pas l’envoyer à l’équipe.
          </p>
          <h2>Destinataires</h2>
          <p>{legalContent.recipientsDetails}</p>
          <h2>Durée de conservation</h2>
          <p>{legalContent.retentionDetails}</p>
          <h2>Cookies et services externes</h2>
          <p>
            Le site public ne dépose actuellement aucun cookie de mesure
            d’audience ou de publicité. Un cookie strictement nécessaire est
            utilisé uniquement pour maintenir la session des personnes autorisées
            dans l’espace d’administration. Il n’est pas déposé lors de la
            consultation des pages publiques.
          </p>
          <p>{legalContent.thirdPartyDetails}</p>
          <p>
            Consultez la{" "}
            <a href="https://www.flyovergreen.com/pdfs/data_protection_policy_en.pdf" rel="noreferrer" target="_blank">
              politique de protection des données de FlyOverGreen
            </a>{" "}
            et la{" "}
            <a href="https://policies.google.com/privacy?hl=fr" rel="noreferrer" target="_blank">
              politique de confidentialité de Google et YouTube
            </a>.
          </p>
          <h2>Vos droits</h2>
          <p>{legalContent.rightsDetails}</p>
          <h2>Nous contacter au sujet de vos données</h2>
          <p>
            Pour toute question ou demande concernant vos données personnelles,
            écrivez à <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>.
          </p>
          <p>
            Si vous estimez, après nous avoir contactés, que vos droits ne sont
            pas respectés, vous pouvez adresser une réclamation à la{" "}
            <a href="https://www.cnil.fr/fr/plaintes" rel="noreferrer" target="_blank">
              Commission nationale de l’informatique et des libertés (CNIL)
            </a>.
          </p>
        </div>
      </section>
    </>
  );
}

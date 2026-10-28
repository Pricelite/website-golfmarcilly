import Link from "next/link";
import { SchoolEnquiryForm } from "@/components/forms/school-enquiry-form";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { siteConfig } from "@/data/site";
import { juniorPrograms } from "@/data/teaching";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Demande pour l’école de golf",
  description: "Demandez des renseignements ou une inscription à l’école de golf du Golf de Marcilly pour un jeune de 4 à 18 ans.",
  path: "/enseignement/inscription",
  indexable: false,
});

export default async function SchoolEnquiryPage({ searchParams }: { searchParams: Promise<{ programme?: string }> }) {
  const { programme } = await searchParams;
  const selectedProgram = juniorPrograms.find((item) => item.key === programme)?.key ?? juniorPrograms[0].key;

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([
        { name: "Accueil", path: "/" },
        { name: "Enseignement", path: "/enseignement" },
        { name: "Demande école de golf", path: "/enseignement/inscription" },
      ])} />
      <section className="bg-[#f7f4e9] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href="/enseignement#ecole-de-golf" className="text-sm font-medium text-emerald-950 underline underline-offset-4 hover:text-emerald-700">← Retour aux groupes de l’école de golf</Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <SectionTitle as="h1" eyebrow="École de golf" title="Renseignements et inscription" description="Présentez-nous votre enfant et le groupe qui vous intéresse. L’accueil vous répondra par email pour confirmer les possibilités d’inscription." />
              <p className="mt-6 text-sm leading-7 text-emerald-950/75">Ce formulaire envoie votre demande à <a className="font-medium underline underline-offset-4" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>. Il ne réserve pas de place et ne déclenche aucun paiement.</p>
            </div>
            <SchoolEnquiryForm initialProgramKey={selectedProgram} />
          </div>
        </div>
      </section>
    </>
  );
}

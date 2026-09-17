import Image from "next/image";
import Link from "next/link";
import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { siteConfig } from "@/data/site";
import { juniorPrograms, sportingLabelCriteria, teachingFaqs, teachingPros } from "@/data/teaching";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Enseignement",
  description: "École de golf de 4 à 18 ans, horaires et tarifs enfants, découverte adultes et contacts des enseignants du Golf de Marcilly près d’Orléans.",
  path: "/enseignement",
});

const sectionClass = "mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8";
const linkClass = "underline underline-offset-4 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4";

export default function TeachingPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([
        { name: "Accueil", path: "/" },
        { name: "Enseignement", path: "/enseignement" },
      ])} />
      <section className="bg-[#f7f4e9]">
        <div className={`${sectionClass} grid items-center gap-10 lg:grid-cols-2`}>
          <div>
            <SectionTitle as="h1" eyebrow="Enseignement · Golf de Marcilly" title="Le plaisir d’apprendre, à tout âge" description="Un premier swing, une nouvelle envie de jouer, un geste à améliorer : trouvez votre point de départ à Marcilly, près d’Orléans." />
            <div className="mt-7 flex flex-wrap gap-3">
              <CTAButton href="#ecole-de-golf">L’école de golf</CTAButton>
              <CTAButton href="#adultes" variant="secondary">Les cours adultes</CTAButton>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src="/images/ecoledegolf.png" alt="Illustration de jeunes golfeurs à l’entraînement" fill priority sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), 588px" className="object-cover" />
          </div>
        </div>
      </section>
      <nav aria-label="Dans cette page" className="border-y border-emerald-950/10">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-7 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          {[["#ecole-de-golf", "Enfants et tarifs"], ["#adultes", "Adultes"], ["#enseignants", "Nos enseignants"], ["#label-sportif", "Label Sportif 2024"], ["#inscription", "Questions et inscription"]].map(([href, label]) => (
            <Link key={href} href={href} className={`py-2 text-sm font-medium text-emerald-950 ${linkClass}`}>{label}</Link>
          ))}
        </div>
      </nav>
      <section id="ecole-de-golf" className={sectionClass}>
        <SectionTitle eyebrow="De 4 à 18 ans" title="Grandir avec le golf" description="Un apprentissage ludique, encadré par des enseignants diplômés, avec un accès aux parcours adapté au niveau de chacun." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {juniorPrograms.map((program) => (
            <article key={program.title} className="rounded-[28px] border border-emerald-950/10 bg-white p-6 shadow-sm shadow-emerald-950/5 sm:p-8">
              <h3 className="font-serif text-3xl text-emerald-950">{program.title}</h3>
              <p className="mt-5 text-emerald-950"><span className="font-serif text-5xl">{program.price}</span><span className="ml-2 text-sm">/ mois</span></p>
              <p className="mt-3 font-semibold text-emerald-800">{program.duration}</p>
              <ul className="my-6 space-y-2 border-y border-emerald-950/10 py-5 text-sm text-emerald-950/80">
                {program.slots.map((slot) => <li key={slot}>{slot}</li>)}
              </ul>
              <CTAButton href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`École de golf — ${program.title}`)}`} variant="secondary">Renseignements et inscription</CTAButton>
            </article>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-emerald-950/70">Créneaux publiés par le club : le groupe, le jour de participation, les périodes de cours et les conditions tarifaires sont à confirmer auprès de l’accueil.</p>
      </section>
      <section id="adultes" className="scroll-mt-28 bg-emerald-950">
        <div className={sectionClass}>
          <SectionTitle tone="inverse" eyebrow="Cours adultes" title="Découvrir ou aller plus loin" />
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <article className="flex flex-col border-t border-white/25 pt-6">
              <h3 className="font-serif text-2xl text-stone-50">Vous débutez ?</h3>
              <p className="mb-6 mt-3 flex-1 text-sm leading-7 text-stone-50/80">Commencez par une journée découverte pour faire vos premiers pas dans le golf.</p>
              <CTAButton href="/initiation/reservation" variant="secondary" className="self-start">Réserver une initiation</CTAButton>
            </article>
            <article className="flex flex-col border-t border-white/25 pt-6">
              <h3 className="font-serif text-2xl text-stone-50">Vous jouez déjà ?</h3>
              <p className="mb-6 mt-3 flex-1 text-sm leading-7 text-stone-50/80">Pour vous perfectionner, échangez avec un pro diplômé. Expliquez votre niveau, vos objectifs et le temps que vous souhaitez consacrer à votre pratique.</p>
              <CTAButton href="#enseignants" variant="secondary" className="self-start">Contacter un enseignant</CTAButton>
            </article>
          </div>
        </div>
      </section>
      <section id="enseignants" className={sectionClass}>
        <SectionTitle eyebrow="Nos pros" title="Un contact direct avec votre enseignant" description="Échangez avant votre prochain cours et consultez les formules et tarifs sur le site de chaque pro." />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {teachingPros.map((pro) => (
            <article key={pro.name} className="flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
              <div className="relative aspect-[4/4.3]">
                <Image alt={pro.name} className="object-cover" fill sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 768px) calc(100vw - 48px), (max-width: 1280px) 33vw, 384px" src={pro.image} />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-serif text-2xl text-emerald-950">{pro.name}</h3>
                <p className="mt-2 text-sm text-emerald-950/70">{pro.specialty}</p>
                <address className="mb-6 mt-5 space-y-3 text-sm not-italic text-emerald-950">
                  <a className={`block w-fit ${linkClass}`} href={`tel:${pro.phoneHref}`}>{pro.phone}</a>
                  <a className={`block break-all ${linkClass}`} href={`mailto:${pro.email}`}>{pro.email}</a>
                </address>
                <CTAButton href={pro.website} className="mt-auto self-start">Formules et tarifs</CTAButton>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="label-sportif" className="scroll-mt-28 bg-[#f7f4e9]">
        <div className={sectionClass}>
          <SectionTitle eyebrow="École de golf · Label Sportif 2024" title="Six repères pour accompagner les jeunes" />
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sportingLabelCriteria.map((criterion, index) => (
              <li key={criterion} className="border-t border-emerald-950/20 pt-5">
                <span aria-hidden="true" className="font-serif text-3xl text-emerald-700">0{index + 1}</span>
                <p className="mt-3 text-base font-medium leading-7 text-emerald-950">{criterion}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section id="inscription" className={`${sectionClass} grid gap-10 lg:grid-cols-2`}>
        <div>
          <SectionTitle eyebrow="Préparer votre venue" title="Parlons de votre prochain cours" description="Pour une inscription enfant ou pour vous orienter, contactez l’accueil. Pour un cours adulte, vous pouvez aussi joindre directement l’enseignant de votre choix." />
          <div className="mt-6 flex flex-wrap gap-3">
            <CTAButton href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</CTAButton>
            <CTAButton href="/reserver-un-cours" variant="secondary">Choisir mon pro</CTAButton>
          </div>
          <p className="mt-5 text-sm text-emerald-950"><a className={`break-all ${linkClass}`} href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></p>
          <p className="mt-3 text-sm leading-7 text-emerald-950/70">{siteConfig.addressLine1}<br />{siteConfig.addressLine2}</p>
        </div>
        <div>
          <h2 className="font-serif text-2xl text-emerald-950">Vos questions pratiques</h2>
          <div className="mt-4 divide-y divide-emerald-950/15">
            {teachingFaqs.map((faq) => (
              <details key={faq.question} className="py-4">
                <summary className="cursor-pointer text-sm font-semibold leading-6 text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4">{faq.question}</summary>
                <p className="mt-3 text-sm leading-7 text-emerald-950/75">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

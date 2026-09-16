import Image from "next/image";
import Link from "next/link";
import { AssociationCalendar } from "@/components/association-calendar";

import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { associationFaqs, associationLinks, associationMembers, associationRoles } from "@/data/association";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Association sportive",
  description: "Découvrez la vie associative au Golf de Marcilly : compétitions, départs, résultats, bénévolat et renseignements pour rejoindre l’AS.",
  path: "/association-sportive",
});

export default function AssociationPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([
        { name: "Accueil", path: "/" },
        { name: "Association sportive", path: "/association-sportive" },
      ])} />

      <section className="bg-[#f7f4e9]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-8">
          <div>
            <SectionTitle as="h1" eyebrow="Association sportive" title="Le golf se vit aussi ensemble" description="Retrouvez les rendez-vous sportifs de Marcilly et les informations utiles pour prendre part à la vie de l’association sportive, l’AS." />
            <div className="mt-7 flex flex-wrap gap-3">
              <CTAButton href="#competitions">Les compétitions</CTAButton>
              <CTAButton href="#rejoindre" variant="secondary">Rejoindre la vie du club</CTAButton>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src="/images/parcours-accueil.png" alt="Les greens et le plan d’eau du Golf de Marcilly" fill priority sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), 526px" className="object-cover" />
          </div>
        </div>
      </section>

      <nav aria-label="Dans cette page" className="border-y border-emerald-950/10">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-7 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          {[
            ["#role", "Le rôle de l’AS"],
            ["#competitions", "Compétitions et résultats"],
            ["#equipe", "L’équipe de l’AS"],
            ["#rejoindre", "Participer"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="py-2 text-sm font-medium text-emerald-950 underline decoration-emerald-950/25 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">{label}</Link>
          ))}
        </div>
      </nav>

      <section id="role" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionTitle eyebrow="Comprendre" title="À quoi sert une association sportive de golf ?" />
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {associationRoles.map((item, index) => (
            <article key={item.title} className="border-t border-emerald-950/20 pt-5">
              <span aria-hidden="true" className="font-serif text-3xl text-emerald-700">0{index + 1}</span>
              <h3 className="mt-4 font-serif text-2xl text-emerald-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-950/75">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="competitions" className="scroll-mt-28 bg-emerald-950 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Vos rendez-vous sportifs" tone="inverse" title="Le calendrier des compétitions" description="Parcourez les mois et sélectionnez une épreuve pour découvrir ses détails. Retrouvez ici les rendez-vous sportifs de Marcilly." />
          <AssociationCalendar initialDate={new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())} />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              { title: "Vérifier son départ", text: "Retrouvez les départs publiés pour les compétitions du club sur le service de la Fédération française de golf.", label: "Consulter les départs", href: associationLinks.starts },
              { title: "Retrouver les résultats", text: "Accédez aux résultats publiés des compétitions et retrouvez les classements des épreuves disputées.", label: "Voir les résultats", href: associationLinks.results },
            ].map((item) => (
              <article key={item.title} className="flex flex-col border-t border-white/25 pt-5">
                <h3 className="font-serif text-2xl text-stone-50">{item.title}</h3>
                <p className="mb-6 mt-3 flex-1 text-sm leading-7 text-stone-100/80">{item.text}</p>
                <CTAButton href={item.href} variant="secondary" className="self-start">{item.label}</CTAButton>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="equipe" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionTitle eyebrow="Les personnes à votre écoute" title="L’équipe de l’association sportive" />
        {associationMembers.length > 0 ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {associationMembers.map((member) => (
              <li key={`${member.name}-${member.role}`} className="border-t border-emerald-950/15 pt-5">
                {member.photo ? <div className="relative mb-4 aspect-square max-w-48 overflow-hidden rounded-2xl"><Image src={member.photo} alt={member.name} fill sizes="192px" className="object-cover" /></div> : null}
                <h3 className="font-serif text-2xl text-emerald-950">{member.name}</h3>
                <p className="mt-2 text-sm text-emerald-800">{member.role}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-950/75">Une question pour l’AS ? L’accueil du golf peut vous orienter vers votre interlocuteur au sein de l’association.</p>
        )}
        <div className="mt-6"><CTAButton href={`tel:${siteConfig.phoneHref}`} variant="ghost">Contacter l’accueil : {siteConfig.phoneDisplay}</CTAButton></div>
      </section>

      <section id="rejoindre" className="scroll-mt-28 bg-[#f7f4e9] py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionTitle eyebrow="À vous de jouer" title="Envie de participer ?" description="Adhérer, découvrir les compétitions ou donner un peu de son temps : prenez contact pour échanger sur votre envie de vous impliquer." />
            <div className="mt-6"><CTAButton href={`tel:${siteConfig.phoneHref}`}>Appeler l’accueil</CTAButton></div>
            <p className="mt-4 text-sm leading-7 text-emerald-950/75">Vous préférez écrire ? <a className="break-all underline underline-offset-4" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-emerald-950">Vos questions pratiques</h2>
            <div className="mt-4 divide-y divide-emerald-950/15">
              {associationFaqs.map((faq) => (
                <details key={faq.question} className="py-4">
                  <summary className="cursor-pointer text-sm font-semibold leading-6 text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-7 text-emerald-950/75">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

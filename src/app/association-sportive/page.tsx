import Image from "next/image";
import Link from "next/link";
import { AssociationCalendar } from "@/components/association-calendar";

import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { associationFaqs, associationGroups, associationLinks, associationPartner, associationRoles } from "@/data/association";
import { associationNews } from "@/data/association-news";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";
import { publicAssociationEvents } from "@/lib/association-events-db";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Association sportive",
  description: "Découvrez la vie associative au Golf de Marcilly : compétitions, départs, résultats, bénévolat et renseignements pour rejoindre l’AS.",
  path: "/association-sportive",
});

export default async function AssociationPage() {
  const calendar = await publicAssociationEvents();
  const currentYear = Number(new Intl.DateTimeFormat("en", { timeZone: "Europe/Paris", year: "numeric" }).format(new Date()));
  const currentNews = associationNews.filter((article) => Number(article.year) === currentYear);
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
            <Image src="/images/parcours-accueil.webp" alt="Les greens et le plan d’eau du Golf de Marcilly" fill priority sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), 526px" className="object-cover" />
          </div>
        </div>
      </section>

      <nav aria-label="Dans cette page" className="border-y border-emerald-950/10">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-7 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          {[
            ["#role", "Le rôle de l’AS"],
            ["#competitions", "Compétitions et résultats"],
            ["#groupes", "Équipes, seniors et académie"],
            ["/association-sportive/equipes", "Nos équipes 2026"],
            ["#actualites", "Actualités"],
            ["#partenaire-as", "Suivi sportif"],
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
          <SectionTitle eyebrow="Vos rendez-vous sportifs" tone="inverse" title="Le calendrier de l’association sportive" description="Retrouvez les compétitions, les créneaux à définir, les jours fériés, les fêtes et les vacances scolaires. Les dates et modalités des compétitions peuvent évoluer." />
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
          <p className="mt-8 text-sm text-stone-100/80">Choisissez un mois et, pour les vacances scolaires, la zone A, B ou C.</p>
          {calendar.unavailable ? <p role="status" className="mt-8 rounded-2xl bg-white p-6 text-emerald-950">Le calendrier est momentanément indisponible. Réessayez dans quelques instants ou contactez l’accueil au {siteConfig.phoneDisplay}.</p> : <AssociationCalendar events={calendar.events} initialDate={new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())} />}
        </div>
      </section>

      <section id="groupes" className="scroll-mt-28 bg-[#f7f4e9] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="À chacun son parcours" title="Vivre le golf à tous les âges" description="Équipes du club, rendez-vous seniors et apprentissage des jeunes : choisissez l’espace qui vous correspond." />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {associationGroups.map((group, index) => (
              <article key={group.title} className="flex min-h-80 flex-col rounded-[28px] border border-emerald-950/10 bg-white p-7 shadow-sm shadow-emerald-950/5 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{group.eyebrow}</p>
                  <span aria-hidden="true" className="font-serif text-3xl text-emerald-950/20">0{index + 1}</span>
                </div>
                <h2 className="mt-8 font-serif text-3xl text-emerald-950">{group.title}</h2>
                <p className="mt-4 flex-1 text-sm leading-7 text-emerald-950/75">{group.description}</p>
                <div className="mt-7"><CTAButton href={group.href} variant="ghost">{group.cta}</CTAButton></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="actualites" className="scroll-mt-28 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="La vie sportive" title="Actualités de Marcilly" description="Retrouvez les actualités de l’année en cours sur les équipes du club." />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {currentNews.map((article) => (
              <article key={article.href} className="flex flex-col overflow-hidden rounded-[24px] border border-emerald-950/10 bg-[#f7f4e9] shadow-sm shadow-emerald-950/5">
                <figure>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={article.image} alt={article.imageAlt} fill sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) 50vw, 390px" className="object-cover" />
                  </div>
                  <figcaption className="px-6 pt-2 text-xs text-emerald-950/60">{article.imageCaption}</figcaption>
                </figure>
                <div className="flex flex-1 flex-col p-6 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{article.category}</p>
                  <span className="font-serif text-2xl text-emerald-950/35">{article.year}</span>
                </div>
                <h3 className="mt-5 font-serif text-2xl text-emerald-950">{article.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-emerald-950/75">{article.summary}</p>
                <a href={article.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center self-start text-sm font-semibold text-emerald-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">Lire l’article · {article.source} ↗</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="partenaire-as" className="scroll-mt-28 bg-[#f7f4e9] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Suivi sportif" title="L'outil de l’association sportive du Golf de Marcilly" description="SwingFlow accompagne le suivi des joueurs et leur progression tout au long de la saison." />
          <div className="mt-8 grid items-center gap-8 rounded-[28px] border border-emerald-950/10 bg-white p-6 shadow-sm shadow-emerald-950/5 sm:p-8 md:grid-cols-[220px_1fr]">
            <a href={associationPartner.href} target="_blank" rel="noopener noreferrer" aria-label="Découvrir SwingFlow (nouvel onglet)" className="flex min-h-40 items-center justify-center rounded-xl bg-white p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
              <Image src={associationPartner.logo} alt="Logo de SwingFlow" width={180} height={123} sizes="180px" className="h-auto max-h-32 w-auto max-w-full object-contain" />
            </a>
            <div>
              <h2 className="font-serif text-3xl text-emerald-950">{associationPartner.name}</h2>
              <p className="mt-4 text-sm leading-7 text-emerald-950/75">{associationPartner.description}</p>
              <a href={associationPartner.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">Découvrir SwingFlow ↗</a>
            </div>
          </div>
        </div>
      </section>

      <section id="equipe" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionTitle eyebrow="Les personnes à votre écoute" title="L’équipe de l’association sportive" />
        <figure className="mt-8">
          <Image
            src="/images/organigramme-association-sportive.webp"
            alt="Organigramme de l’association sportive : bureau, commissions, membres de droit et invités permanents."
            width={1025}
            height={768}
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="h-auto w-full rounded-3xl"
          />
          <figcaption className="mt-3 text-sm text-emerald-950/75">
            <a className="underline underline-offset-4" href="/images/organigramme-association-sportive.webp" target="_blank" rel="noopener noreferrer">Ouvrir l’organigramme en grand</a>
          </figcaption>
        </figure>
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

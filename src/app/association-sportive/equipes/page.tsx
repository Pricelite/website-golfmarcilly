import Image from "next/image";
import Link from "next/link";
import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { associationTeamGroups } from "@/data/association-teams";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Les équipes de l’association sportive",
  description: "Découvrez les équipes du Golf de Marcilly, leurs divisions et les résultats publiés pour la saison 2026.",
  path: "/association-sportive/equipes",
});

export default function AssociationTeamsPage() {
  return <>
    <JsonLd data={buildBreadcrumbSchema([
      { name: "Accueil", path: "/" },
      { name: "Association sportive", path: "/association-sportive" },
      { name: "Les équipes", path: "/association-sportive/equipes" },
    ])} />
    <section className="bg-emerald-950 text-stone-50">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Association sportive · Saison 2026</p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl">Les équipes de Marcilly</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-100/85">Des équipes adultes aux jeunes et aux seniors, retrouvez leurs divisions en 2026 et les résultats publiés. Les liens de chaque fiche permettent de consulter la source.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <CTAButton href="#adultes" variant="secondary">Voir les équipes</CTAButton>
            <CTAButton href="/association-sportive" variant="secondary">L’association sportive</CTAButton>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
          <Image src="/images/parcours-18t-competition.jpg" alt="Parcours de compétition du Golf de Marcilly" fill priority sizes="(max-width: 1024px) 100vw, 580px" className="object-cover" />
        </div>
      </div>
    </section>
    <nav aria-label="Catégories d’équipes" className="border-b border-emerald-950/10 bg-[#f7f4e9]">
      <div className="mx-auto flex max-w-7xl flex-wrap gap-x-7 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        {associationTeamGroups.map(group => <Link key={group.id} href={`#${group.id}`} className="py-2 text-sm font-semibold text-emerald-950 underline decoration-emerald-950/25 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">{group.title}</Link>)}
      </div>
    </nav>
    <div className="bg-[#f7f4e9]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {associationTeamGroups.map(group => <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="scroll-mt-28 pt-12 first:pt-0 sm:pt-16 sm:first:pt-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{group.eyebrow}</p>
          <h2 id={`${group.id}-title`} className="mt-2 font-serif text-3xl text-emerald-950 sm:text-4xl">{group.title}</h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {group.teams.map(team => <article key={team.title} className="overflow-hidden rounded-[26px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
              <div className="relative aspect-[16/9]">
                <Image src={team.image} alt={team.imageSourceUrl ? `${team.title}, saison 2025` : `Vue du Golf de Marcilly illustrant ${team.title.toLowerCase()}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
              </div>
              <div className="p-6">
                <p className="text-xs text-emerald-950/60">{team.imageSourceUrl ? <a href={team.imageSourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">{team.imageCaption} · Comité Golf 45 ↗</a> : team.imageCaption}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{team.division}</p>
                <h3 className="mt-3 font-serif text-2xl text-emerald-950">{team.title}</h3>
                <p className="mt-3 min-h-16 text-sm leading-6 text-emerald-950/75">{team.result}</p>
                <a href={team.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Source : {team.source} ↗</a>
              </div>
            </article>)}
          </div>
        </section>)}
        <div className="mt-14 border-t border-emerald-950/15 pt-8">
          <h2 className="font-serif text-2xl text-emerald-950">Vous avez une photo d’équipe ou un résultat à ajouter ?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-950/75">Cette page pourra être complétée avec les portraits, les compositions et les résultats transmis par l’association sportive.</p>
          <div className="mt-5"><CTAButton href="/contact" variant="secondary">Contacter le golf</CTAButton></div>
        </div>
      </div>
    </div>
  </>;
}

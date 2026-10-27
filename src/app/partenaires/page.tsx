import Image from "next/image";

import { SponsorMarquee } from "@/components/sections/sponsor-marquee";
import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

const partnershipIdeas = [
  {
    label: "La vie sportive",
    title: "Compétitions",
    description: "Associez votre entreprise à une compétition, à une remise des prix ou à une dotation imaginée avec notre équipe.",
    image: "/images/accueil-trou-6.png",
    imageAlt: "Green et drapeau du Golf de Marcilly",
  },
  {
    label: "Sur le terrain",
    title: "Parcours",
    description: "Imaginez une présence au fil du jeu : autour d’un départ, d’un trou ou d’un espace du parcours.",
    image: "/images/parcours-accueil.webp",
    imageAlt: "Parcours arboré du Golf de Marcilly",
  },
  {
    label: "L’entraînement",
    title: "Practice",
    description: "Accompagnez le lieu où les joueurs s’échauffent, s’entraînent et découvrent le golf toute l’année.",
    image: "/images/practice-enseignement-vue-aerienne-sans-sacs.png",
    imageAlt: "Vue aérienne du practice du Golf de Marcilly",
  },
  {
    label: "En ligne",
    title: "Visibilité sur le site",
    description: "Faites découvrir votre activité aux visiteurs du site à travers un espace partenaire ou un contenu adapté.",
    image: "/images/partenaire-visibilite-site.png",
    imageAlt: "Illustration d’un emplacement publicitaire sur le site du Golf de Marcilly, affichée sur un ordinateur",
  },
  {
    label: "Au club-house",
    title: "Écrans & espaces d’accueil",
    description: "Étudions une présence sur les écrans du club-house ou dans les espaces que fréquentent joueurs et visiteurs.",
    image: "/images/bar-la-bergerie-seminaire.jpeg",
    imageAlt: "Espace d’accueil et bar La Bergerie du Golf de Marcilly",
  },
  {
    label: "Dans la durée",
    title: "Golf & association sportive",
    description: "Soutenez plus largement la vie du golf, les équipes et les projets portés par l’association sportive.",
    image: "/images/equipes/equipe-1-messieurs-2025.jpg",
    imageAlt: "Équipe messieurs du Golf de Marcilly en 2025",
  },
] as const;

export const metadata = buildMetadata({
  title: "Devenir partenaire du Golf de Marcilly",
  description: "Compétitions, parcours, practice, site internet ou club-house : découvrez les possibilités de partenariat avec le Golf de Marcilly et son association sportive.",
  path: "/partenaires",
  image: "/images/accueil-club-house.png",
});

export default function PartnersPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([
        { name: "Accueil", path: "/" },
        { name: "Partenaires", path: "/partenaires" },
      ])} />

      <section className="overflow-hidden bg-emerald-950 text-stone-50">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
          <div className="flex flex-col justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#dbe9b4]">Golf de Marcilly · Partenariats</p>
            <h1 className="mt-6 max-w-2xl font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Votre marque a <span className="italic text-[#dbe9b4]">sa place</span> à Marcilly.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-stone-100/85 sm:text-lg">
              Une compétition, un parcours, le practice, le site ou le club-house : construisons une présence qui vous ressemble et qui accompagne la vie du golf.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CTAButton href="#possibilites" variant="secondary">Découvrir les possibilités</CTAButton>
              <CTAButton href="/contact#reservation" variant="secondary">Parlons de votre projet</CTAButton>
            </div>
          </div>
          <div className="relative min-h-72 sm:min-h-96 lg:min-h-full">
            <Image
              src="/images/accueil-club-house.png"
              alt="Vue aérienne du Golf de Marcilly, de son practice et de son club-house"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-emerald-950/35 to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-20 lg:bg-gradient-to-r" />
            <div className="absolute bottom-5 left-5 rounded-full border border-white/30 bg-emerald-950/80 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm sm:bottom-7 sm:left-7">
              Un lieu, mille façons de se rencontrer
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-emerald-950/10 bg-[#e9efe6]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900 sm:grid-cols-3 sm:px-6 lg:px-8">
          <p>Sur le parcours</p>
          <p>Dans le club-house</p>
          <p>En ligne</p>
        </div>
      </section>

      <section id="possibilites" className="scroll-mt-24 bg-[#f7f4e9] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <SectionTitle
              eyebrow="Devenir partenaire"
              title="Choisissez la façon de prendre part à l’aventure"
              description="Compétition, parcours, practice ou supports de communication : choisissez les espaces adaptés à votre activité."
            />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {partnershipIdeas.map((idea) => (
              <article key={idea.title} className="flex h-full flex-col overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={idea.image} alt={idea.imageAlt} fill sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1280px) calc((100vw - 72px) / 2), 389px" className="object-cover" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-emerald-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-white">{idea.label}</span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="font-serif text-2xl text-emerald-950 sm:text-[1.75rem]">{idea.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-emerald-950/75">{idea.description}</p>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Ils nous accompagnent"
            title="Nos partenaires"
            description="Merci aux entreprises et aux acteurs qui participent déjà à la vie du Golf de Marcilly."
          />
        </div>
        <div className="mt-10"><SponsorMarquee /></div>
      </section>

      <section className="bg-[#f7f4e9] px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 rounded-[30px] bg-emerald-950 p-7 text-stone-50 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dbe9b4]">Construisons votre partenariat</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Faisons connaissance.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-100/80">Parlez-nous de votre activité et de ce que vous aimeriez imaginer avec Marcilly. Nous étudierons ensemble le format qui vous convient.</p>
          </div>
          <CTAButton href="/contact#reservation" variant="secondary" className="shrink-0 self-start">Devenir partenaire</CTAButton>
        </div>
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";

import { QuoteForm } from "@/components/forms/quote-form";
import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { eventFormats } from "@/data/events";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Événements & séminaires d’entreprise",
  description:
    "Organisez un séminaire, un team building ou une réception au Golf de Marcilly, près d’Orléans. Découvrez les espaces, les activités et demandez un devis.",
  path: "/evenements",
  image: "/images/practice-golf.png",
});

export default function EventsPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Événements", path: "/evenements" },
        ])}
      />

      <section className="relative isolate overflow-hidden bg-emerald-950 text-stone-50">
        <Image
          src="/images/practice-golf.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,32,25,0.96)_0%,rgba(4,32,25,0.82)_48%,rgba(4,32,25,0.28)_100%)]" />
        <div className="mx-auto max-w-7xl px-4 pb-28 pt-24 sm:px-6 sm:pb-36 sm:pt-32 lg:px-8 lg:pt-40">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#dbe9b4]">
              Séminaires & événements · près d’Orléans
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.04] sm:text-6xl lg:text-7xl">
              Sortez du cadre.
              <span className="block italic text-[#dbe9b4]">Rassemblez vos équipes.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-stone-100/90 sm:text-lg">
              Une journée de travail, un moment à partager, un repas qui prolonge les échanges : composez votre événement au Golf de Marcilly.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <CTAButton href="#devis" variant="secondary">Parlons de votre projet <span aria-hidden="true" className="ml-2">↗</span></CTAButton>
              <Link href="#formats" className="inline-flex items-center justify-center rounded-full border border-white/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950">Découvrir les formats</Link>
            </div>
            <p className="mt-10 border-t border-white/25 pt-5 text-sm tracking-wide text-stone-100/85">
              Séminaires <span className="mx-3 text-[#dbe9b4]">·</span> Team building <span className="mx-3 text-[#dbe9b4]">·</span> Réceptions
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Les atouts de votre événement" className="relative z-10 mx-auto -mt-10 grid max-w-7xl gap-px overflow-hidden rounded-[28px] border border-emerald-950/10 bg-emerald-950/10 shadow-xl shadow-emerald-950/10 md:grid-cols-3">
        {[
          { title: "Un cadre au vert", text: "Prenez l’air et changez de perspective à quelques kilomètres d’Orléans." },
          { title: "Une activité à partager", text: "Faites découvrir le golf à vos invités, même s’ils n’ont jamais joué." },
          { title: "La Bergerie sur place", text: "Prolongez la journée autour d’un déjeuner ou d’un moment convivial." },
        ].map((item, index) => (
          <div key={item.title} className="bg-[#f7f4e9] p-6 sm:p-8">
            <span className="text-xs font-semibold tracking-[0.24em] text-emerald-700">0{index + 1}</span>
            <h2 className="mt-3 font-serif text-2xl text-emerald-950">{item.title}</h2>
            <p className="mt-2 text-sm leading-7 text-emerald-950/75">{item.text}</p>
          </div>
        ))}
      </section>

      <section id="formats" className="scroll-mt-28 bg-[#f7f4e9] px-4 pb-20 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="À chaque projet son format"
            title="À vous d’imaginer la journée"
            description="Réunir vos équipes, remercier vos clients ou simplement passer un bon moment ensemble : choisissez le point de départ, nous étudierons la suite avec vous."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {eventFormats.map((format) => (
              <article key={format.title} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={format.image} alt={format.imageAlt} fill sizes="(max-width: 1024px) 100vw, 400px" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{format.eyebrow}</p>
                  <h3 className="mt-3 font-serif text-3xl text-emerald-950">{format.title}</h3>
                  <p className="mt-4 flex-1 text-sm leading-7 text-emerald-950/75">{format.description}</p>
                  <Link href="#devis" className="mt-7 inline-flex w-fit items-center gap-2 border-b border-emerald-800 pb-1 text-sm font-semibold text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4">Parler de ce format <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] lg:aspect-[5/6]">
          <Image src="/images/club-house-marcilly.png" alt="Le club-house et le green du Golf de Marcilly" fill sizes="(max-width: 1024px) 100vw, 600px" className="object-cover object-center" />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-emerald-950/90 p-5 text-stone-50 backdrop-blur sm:inset-x-auto sm:left-6 sm:max-w-xs">
            <p className="font-serif text-2xl">Le bon équilibre entre travail et plaisir.</p>
          </div>
        </div>
        <div>
          <SectionTitle
            eyebrow="Une expérience à composer"
            title="Une journée qui vous ressemble"
            description="Du premier accueil au dernier échange, composez un programme selon l’objectif de votre événement et les envies de vos invités."
          />
          <ol className="mt-9 space-y-6">
            {[
              { title: "Se retrouver", text: "Un cadre différent pour une réunion, une présentation ou un temps d’échange." },
              { title: "Vivre quelque chose ensemble", text: "Une initiation ou une activité autour du golf pour créer des souvenirs communs." },
              { title: "Prolonger la conversation", text: "Un déjeuner ou une réception à La Bergerie pour conclure la journée." },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-5 border-t border-emerald-950/15 pt-5">
                <span className="font-serif text-2xl text-emerald-700">0{index + 1}</span>
                <div>
                  <h3 className="font-serif text-2xl text-emerald-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-emerald-950/75">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-9"><CTAButton href="#devis">Composer mon événement</CTAButton></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-[28px] bg-emerald-950 p-7 text-stone-50 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dbe9b4]">Et pour vos moments personnels ?</p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl">Célébrez aussi les belles occasions.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-100/80">Mariage, anniversaire ou repas de groupe : racontez-nous ce que vous imaginez pour étudier les possibilités au domaine.</p>
          </div>
          <CTAButton href="#devis" variant="secondary" className="shrink-0 self-start">Présenter mon projet</CTAButton>
        </div>
      </section>

      <section id="devis" className="scroll-mt-28 bg-[#e8eee3] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionTitle
              eyebrow="Votre événement commence ici"
              title="Parlons de votre projet"
              description="Une date en tête, un nombre d’invités ou simplement une idée ? Dites-nous ce que vous souhaitez organiser. L’équipe reviendra vers vous pour construire une proposition adaptée."
            />
            <div className="mt-8 border-t border-emerald-950/15 pt-6">
              <p className="text-sm text-emerald-950/70">Vous préférez en parler directement ?</p>
              <a className="mt-2 inline-block font-serif text-2xl text-emerald-950 underline decoration-emerald-700/40 underline-offset-4" href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>
            </div>
          </div>
          <QuoteForm />
        </div>
      </section>
    </>
  );
}

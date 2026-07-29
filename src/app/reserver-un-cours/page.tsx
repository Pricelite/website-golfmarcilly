import Link from "next/link";

import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { teachingPros } from "@/data/teaching";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Reserver un cours",
  description:
    "Choisissez votre pro au Golf de Marcilly et accedez directement a son site pour reserver un cours.",
  path: "/reserver-un-cours",
});

export default function BookLessonPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Enseignement", path: "/enseignement" },
          { name: "Reserver un cours", path: "/reserver-un-cours" },
        ])}
      />

      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-emerald-950 text-stone-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(133,188,143,0.2),transparent_28%),linear-gradient(135deg,rgba(6,24,20,0.96),rgba(10,44,35,0.88))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-200/80">
              Enseignement
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] text-stone-50 sm:text-6xl">
              Choisissez votre pro
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-50/80">
              Accedez directement au site du pro qui vous correspond pour reserver
              votre cours.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Reservation"
          title="Trois pros, trois acces directs"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {teachingPros.map((pro) => (
            <article
              className="flex h-full flex-col rounded-[32px] border border-emerald-950/10 bg-white p-8 shadow-sm shadow-emerald-950/5"
              key={pro.name}
            >
              <div className="rounded-full border border-emerald-950/10 bg-stone-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Pro enseignant
              </div>
              <h2 className="mt-6 font-serif text-3xl text-emerald-950">{pro.name}</h2>
              <p className="mt-4 flex-1 text-sm leading-7 text-emerald-950/76">
                {pro.specialty}
              </p>
              <div className="mt-8">
                <CTAButton href={pro.website}>Voir le site du pro</CTAButton>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10">
          <Link className="text-sm font-medium text-emerald-900 underline-offset-4 hover:underline" href="/enseignement">
            Retour a l&apos;enseignement
          </Link>
        </div>
      </section>
    </>
  );
}

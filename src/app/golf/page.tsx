import Image from "next/image";
import { CourseCard } from "@/components/ui/course-card";
import { CourseVariantCard } from "@/components/course-variant-card";
import { CourseFlyoverModal } from "@/components/course-flyover-modal";
import { CTAButton } from "@/components/ui/cta-button";
import { siteConfig } from "@/data/site";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { courses } from "@/data/courses";
import { golfPhotos } from "@/data/golf-photos";
import { pricingSections, type PricingSection } from "@/data/pricing";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Golf / Parcours",
  description:
    "Parcours 18 trous, 9 trous, Kaleka course aller, practice et formats loisirs pour jouer au golf près d’Orléans dans le Loiret.",
  path: "/golf",
});

export default function GolfPage() {
  const practicePricing = pricingSections.find(section => section.title === "Practice");
  const greenFees = pricingSections.find(section => section.title === "Green fees");
  const coursePrices = (labels: string[], displayLabel?: string): PricingSection | undefined => greenFees ? {
    ...greenFees,
    rows: greenFees.rows.filter(row => labels.includes(row.label)).map(row => displayLabel ? { ...row, label: displayLabel } : row),
  } : undefined;
  const kalekaCombinedLabel = "18 trous Kaleka course aller et retour";
  const pricingByCourse: Record<string, PricingSection | undefined> = {
    practice: practicePricing,
    "parcours-decouverte-9-trous": coursePrices(["9 trous Découverte ou Footgolf"], "9 trous Découverte"),
    footgolf: coursePrices(["9 trous Découverte ou Footgolf"], "9 trous Footgolf"),
    "pitch-putt-kaleka-18-trous": coursePrices(["9 trous Kaleka course aller", kalekaCombinedLabel]),
    "kaleka-course": coursePrices(["9 trous Kaleka course retour", kalekaCombinedLabel]),
    "parcours-competitions-18-trous": coursePrices(["9 trous Grand Parcours", "18 trous Grand Parcours", "18 trous après 16 h 00"]),
  };
  const orderedCourses = [
    courses.find((course) => course.slug === "practice"),
    courses.find((course) => course.slug === "parcours-decouverte-9-trous"),
    courses.find((course) => course.slug === "pitch-putt-kaleka-18-trous"),
    courses.find((course) => course.slug === "parcours-competitions-18-trous"),
  ].filter((course): course is NonNullable<typeof course> => Boolean(course));
  const footgolf = courses.find(course => course.slug === "footgolf");
  const kaleka = courses.find(course => course.slug === "kaleka-course");

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Golf / Parcours", path: "/golf" },
        ])}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          as="h1"
          description="Le domaine propose plusieurs façons de jouer et de progresser : grand parcours, format court, entraînement et activités de groupe."
          eyebrow="Golf de Marcilly-Orléans"
          title="Des parcours complémentaires pour tous les niveaux"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {orderedCourses.map((course) => course.slug === "parcours-decouverte-9-trous" && footgolf
            ? <CourseVariantCard
                key={course.slug}
                id={course.slug}
                first={course}
                second={footgolf}
                firstLabel="Découverte"
                secondLabel="Footgolf"
                firstPricing={pricingByCourse[course.slug]}
                secondPricing={pricingByCourse.footgolf}
                headingLevel="h2"
              />
            : course.slug === "pitch-putt-kaleka-18-trous" && kaleka
            ? <CourseVariantCard
                key={course.slug}
                id={course.slug}
                first={course}
                second={kaleka}
                firstLabel="Kaleka course aller"
                secondLabel="Kaleka course retour"
                firstPricing={pricingByCourse[course.slug]}
                secondPricing={pricingByCourse["kaleka-course"]}
                headingLevel="h2"
              />
            : <CourseCard
                key={course.slug}
                {...course}
                id={course.slug}
                headingLevel="h2"
                pricing={pricingByCourse[course.slug]}
                action={course.slug === "parcours-competitions-18-trous" ? <CourseFlyoverModal /> : undefined}
              />)}
        </div>
        <section id="galerie" aria-label="Le golf en images" className="mt-16 scroll-mt-28">
          <SectionTitle as="h2" eyebrow="Au fil du domaine" title="Le golf en images" description="Des greens bordés d’arbres aux départs ouverts sur le parcours, découvrez le cadre du Golf de Marcilly." />
          <div className="mt-8 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {golfPhotos.map(photo => <figure key={photo.src} className="mb-5 break-inside-avoid overflow-hidden rounded-[26px] border border-emerald-950/10 bg-white">
              <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw" className="h-auto w-full" />
              <figcaption className="px-5 py-4 text-sm text-emerald-950/80">{photo.caption}</figcaption>
            </figure>)}
          </div>
        </section>
        <aside className="mt-8 rounded-3xl border border-emerald-950/15 bg-emerald-50/60 p-6">
          <h2 className="font-serif text-2xl">Avant de choisir votre départ</h2>
          <p className="mt-3 text-sm leading-7 text-emerald-950/85">La licence de golf est obligatoire pour accéder au grand parcours. Vous venez pour la première fois ? Contactez l’accueil pour préparer votre venue, choisir votre parcours et connaître les possibilités de location de matériel.</p>
          <div className="mt-4"><CTAButton href={`tel:${siteConfig.phoneHref}`} variant="secondary">Appeler l’accueil</CTAButton></div>
        </aside>
        <div className="mt-8 flex flex-wrap gap-3">
          <CTAButton href="/tarifs">Consulter les tarifs</CTAButton>
          <CTAButton href={siteConfig.bookingEngineUrl} variant="secondary">Réserver un départ</CTAButton>
        </div>
      </section>
    </>
  );
}

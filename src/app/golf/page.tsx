import { CourseCard } from "@/components/ui/course-card";
import { CTAButton } from "@/components/ui/cta-button";
import { siteConfig } from "@/data/site";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { courses } from "@/data/courses";
import { pricingSections, type PricingSection } from "@/data/pricing";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Golf / Parcours",
  description:
    "Parcours 18 trous, 9 trous, pitch & putt, practice et formats loisirs pour jouer au golf près d'Orléans dans le Loiret.",
  path: "/golf",
});

export default function GolfPage() {
  const practicePricing = pricingSections.find(section => section.title === "Practice");
  const greenFees = pricingSections.find(section => section.title === "Green fees");
  const coursePrices = (labels: string[]): PricingSection | undefined => greenFees ? {
    ...greenFees,
    rows: greenFees.rows.filter(row => labels.includes(row.label)),
  } : undefined;
  const pricingByCourse: Record<string, PricingSection | undefined> = {
    practice: practicePricing,
    "parcours-decouverte-9-trous": coursePrices(["9 trous Découverte ou Footgolf"]),
    "pitch-putt-kaleka-18-trous": coursePrices(["18 trous Pitch & Putt ou Kaleka"]),
    "parcours-competitions-18-trous": coursePrices(["9 trous Grand Parcours", "18 trous Grand Parcours", "18 trous après 16h00"]),
  };
  const orderedCourses = [
    courses.find((course) => course.slug === "practice"),
    courses.find((course) => course.slug === "parcours-decouverte-9-trous"),
    courses.find((course) => course.slug === "pitch-putt-kaleka-18-trous"),
    courses.find((course) => course.slug === "parcours-competitions-18-trous"),
  ].filter((course): course is (typeof courses)[number] => Boolean(course));

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
          description="Le domaine propose plusieurs façons de jouer et de progresser : grand parcours, format court, entraînement et activités groupes."
          eyebrow="Golf de Marcilly-Orléans"
          title="Des parcours complémentaires pour tous les niveaux"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {orderedCourses.map((course) => (
            <CourseCard key={course.slug} {...course} pricing={pricingByCourse[course.slug]} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <CTAButton href="/tarifs">Consulter les tarifs</CTAButton>
          <CTAButton href={siteConfig.reservationUrl} variant="secondary">Réserver un départ</CTAButton>
        </div>
      </section>
    </>
  );
}

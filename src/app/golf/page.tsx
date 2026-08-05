import { CourseCard } from "@/components/ui/course-card";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { courses } from "@/data/courses";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Golf / Parcours",
  description:
    "Parcours 18 trous, 9 trous, pitch & putt, practice et formats loisirs pour jouer au golf près d'Orléans dans le Loiret.",
  path: "/golf",
});

export default function GolfPage() {
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
          eyebrow="Golf Orléans"
          title="Des parcours complémentaires pour tous les niveaux"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {orderedCourses.map((course) => (
            <CourseCard key={course.slug} showMeta={false} {...course} />
          ))}
        </div>
      </section>
    </>
  );
}

import InitiationReservationForm from "@/components/initiation-reservation-form";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";
import { initiationExperience } from "@/data/initiation-experience";

export const metadata = buildMetadata({
  title: "Réserver une initiation",
  description:
    "Demandez une initiation au Golf de Marcilly à la date souhaitée. Notre équipe vous confirmera la disponibilité par e-mail.",
  path: "/initiation/reservation",
  indexable: false,
});

export default function InitiationReservationPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Je débute le golf", path: "/je-debute-le-golf" },
          { name: "Réserver une initiation", path: "/initiation/reservation" },
        ])}
      />

      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-emerald-950 text-stone-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(170,206,160,0.22),transparent_28%),linear-gradient(135deg,rgba(6,24,20,0.96),rgba(10,44,35,0.88))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-200/80">
              Initiation golf
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl">
              Réserver une initiation
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-50/80">
              Choisissez la date souhaitée et votre formule avec ou sans repas.
              Notre équipe vous confirmera la réservation par e-mail, selon les disponibilités.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Réservation"
          title="Un parcours simple pour débuter"
          description="Choisissez la date et l'horaire qui vous conviennent, puis renseignez vos coordonnées."
        />
        <div className="mt-10">
          <InitiationReservationForm />
        </div>
        <aside aria-labelledby="first-visit-title" className="mt-8 rounded-3xl border border-emerald-950/15 bg-emerald-50/60 p-6">
          <h2 id="first-visit-title" className="font-serif text-2xl">Préparer votre première visite</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-emerald-950/85">
            <li>Prévoyez une tenue confortable et des chaussures plates et stables, adaptées à la météo.</li>
            <li>{initiationExperience.lesson}, puis {initiationExperience.course}.</li>
            <li>{initiationExperience.equipment}. Avec la formule repas, prévoyez aussi 1 h à La Bergerie.</li>
            <li>L’équipe vous précisera le point de rendez-vous et les modalités en cas de mauvais temps lors de la confirmation.</li>
          </ul>
          <p className="mt-4 text-sm leading-7">La demande ne vaut pas réservation. L’équipe confirme la disponibilité par e-mail ; le paiement s’effectue sur place.</p>
        </aside>
      </section>

    </>
  );
}

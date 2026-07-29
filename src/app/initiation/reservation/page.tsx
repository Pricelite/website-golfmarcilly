import InitiationReservationForm from "@/components/initiation-reservation-form";
import PublicCalendarEmbed from "@/components/public-calendar-embed";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { INITIATION_CALENDAR_EMBED_URL } from "@/lib/calendar";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Réserver une initiation",
  description:
    "Réservez votre initiation golf au Golf de Marcilly avec choix du créneau, du nombre de participants et de la formule.",
  path: "/initiation/reservation",
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
              Sélectionnez un créneau disponible, indiquez votre groupe et votre
              formule, puis poursuivez vers la confirmation ou le paiement selon
              la configuration active du site.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Réservation"
          title="Un parcours simple pour débuter"
          description="Le flux utilise désormais la logique de réservation moderne déjà présente côté API, avec contrôle des places et suivi du statut."
        />
        <div className="mt-10">
          <InitiationReservationForm />
        </div>
      </section>

      <section className="bg-white/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicCalendarEmbed
            title="Planning initiation"
            src={INITIATION_CALENDAR_EMBED_URL}
            highlightWeekends
          />
        </div>
      </section>
    </>
  );
}

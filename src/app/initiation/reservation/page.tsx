import InitiationReservationForm from "@/components/initiation-reservation-form";
import { JsonLd } from "@/components/ui/json-ld";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Réserver une initiation",
  description: "Demandez une initiation au Golf de Marcilly à la date souhaitée. Notre équipe vous confirmera la disponibilité par e-mail.",
  path: "/initiation/reservation",
  indexable: false,
});

export default async function InitiationReservationPage({ searchParams }: { searchParams: Promise<{ formule?: string }> }) {
  const { formule } = await searchParams;
  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([
        { name: "Accueil", path: "/" },
        { name: "Je débute le golf", path: "/je-debute-le-golf" },
        { name: "Réserver une initiation", path: "/initiation/reservation" },
      ])} />
      <section className="border-b border-emerald-950/10 bg-[#f7f4e9]">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Initiation golf</p>
          <h1 className="mt-3 font-serif text-4xl text-emerald-950 sm:text-5xl">Réserver une initiation</h1>
          <p className="mt-4 text-sm leading-7 text-emerald-950/75">Choisissez un créneau, puis indiquez vos coordonnées. L’équipe confirme votre demande par e-mail et le paiement se fait sur place.</p>
        </div>
      </section>
      <section className="px-4 py-8 sm:px-6 sm:py-12">
        <InitiationReservationForm initialMeal={formule === "avec-repas" ? "WITH_MEAL" : "WITHOUT_MEAL"} />
      </section>
    </>
  );
}


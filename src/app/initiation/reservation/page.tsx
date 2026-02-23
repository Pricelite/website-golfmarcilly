import type { Metadata } from "next";

import InitiationReservationForm from "@/components/initiation-reservation-form";

export const metadata: Metadata = {
  title: "Reservation initiation | Golf de Marcilly",
  description:
    "Reserve your initiation slot online and complete payment securely.",
};

type InitiationReservationPageProps = {
  searchParams: Promise<{ mealOption?: string }>;
};

export default async function InitiationReservationPage(
  props: InitiationReservationPageProps
) {
  const searchParams = await props.searchParams;
  const initialMealOption =
    searchParams.mealOption === "WITH_MEAL" ||
    searchParams.mealOption === "WITHOUT_MEAL"
      ? searchParams.mealOption
      : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-emerald-900/10 bg-white/80 p-7 shadow-xl shadow-emerald-900/10">
        <h1 className="font-[var(--font-display)] text-3xl text-emerald-950">
          Reservation initiation
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-emerald-900/75">
          Choisissez votre creneau du vendredi au dimanche, indiquez le nombre
          de participants, puis reglez en ligne pour confirmer la reservation.
        </p>
      </section>

      <div className="mt-7">
        <InitiationReservationForm initialMealOption={initialMealOption} />
      </div>
    </main>
  );
}

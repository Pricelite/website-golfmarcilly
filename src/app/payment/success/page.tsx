import InitiationPaymentStatus from "@/components/initiation-payment-status";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Paiement initiation",
  description:
    "Suivi du statut de votre réservation d'initiation au Golf de Marcilly.",
  path: "/payment/success",
});

type PaymentSuccessPageProps = {
  searchParams: Promise<{ reservationId?: string }>;
};

export default async function PaymentSuccessPage(
  props: PaymentSuccessPageProps
) {
  const searchParams = await props.searchParams;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <section className="rounded-[32px] border border-emerald-900/10 bg-white/90 p-8 shadow-xl shadow-emerald-900/10">
        <h1 className="font-[var(--font-display)] text-3xl text-emerald-950">
          Vérification de votre réservation
        </h1>
        <p className="mt-3 text-sm leading-7 text-emerald-900/75">
          Nous vérifions le statut de votre paiement et de votre réservation
          d&apos;initiation.
        </p>
        <div className="mt-6">
          <InitiationPaymentStatus reservationId={searchParams.reservationId} />
        </div>
      </section>
    </main>
  );
}

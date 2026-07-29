import Link from "next/link";

import InitiationPaymentStatus from "@/components/initiation-payment-status";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Paiement interrompu",
  description:
    "Reprenez ou vérifiez votre réservation d'initiation au Golf de Marcilly.",
  path: "/payment/cancel",
});

type PaymentCancelPageProps = {
  searchParams: Promise<{ reservationId?: string }>;
};

export default async function PaymentCancelPage(props: PaymentCancelPageProps) {
  const searchParams = await props.searchParams;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <section className="rounded-[32px] border border-emerald-900/10 bg-white/90 p-8 shadow-xl shadow-emerald-900/10">
        <h1 className="font-[var(--font-display)] text-3xl text-emerald-950">
          Paiement interrompu
        </h1>
        <p className="mt-3 text-sm leading-7 text-emerald-900/75">
          Votre paiement n&apos;a pas été finalisé. Vous pouvez vérifier l&apos;état
          de la réservation ci-dessous puis relancer le parcours si nécessaire.
        </p>
        <div className="mt-6">
          <InitiationPaymentStatus reservationId={searchParams.reservationId} />
        </div>
        <div className="mt-6">
          <Link
            className="inline-flex rounded-full border border-emerald-900/20 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
            href="/initiation/reservation"
          >
            Retour à la réservation
          </Link>
        </div>
      </section>
    </main>
  );
}

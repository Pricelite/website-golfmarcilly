import type { Metadata } from "next";

import InitiationPaymentStatus from "@/components/initiation-payment-status";

export const metadata: Metadata = {
  title: "Paiement initiation | Confirmation",
  description: "Confirmation de paiement pour votre reservation initiation.",
  robots: {
    index: false,
    follow: false,
  },
};

type SuccessPageProps = {
  searchParams: Promise<{ reservationId?: string }>;
};

export default async function PaymentSuccessPage(props: SuccessPageProps) {
  const searchParams = await props.searchParams;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <section className="rounded-3xl border border-emerald-900/10 bg-white/80 p-7 shadow-xl shadow-emerald-900/10">
        <h1 className="font-[var(--font-display)] text-3xl text-emerald-950">
          Paiement initiation
        </h1>
        <p className="mt-3 text-sm text-emerald-900/75">
          Verification de votre paiement en cours.
        </p>
        <div className="mt-6">
          <InitiationPaymentStatus reservationId={searchParams.reservationId} />
        </div>
      </section>
    </main>
  );
}

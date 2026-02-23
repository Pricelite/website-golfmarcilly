"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ReservationStatus =
  | "PENDING"
  | "PAID"
  | "CANCELED"
  | "EXPIRED"
  | "FAILED";

type ReservationView = {
  id: string;
  status: ReservationStatus;
  totalPriceCents: number;
  participantsCount: number;
  mealOption: "WITH_MEAL" | "WITHOUT_MEAL";
  slot: {
    date: string;
    startTime: string;
    endTime: string;
  } | null;
};

type ReservationApiResponse = {
  ok: boolean;
  error?: string;
  reservation?: ReservationView;
};

function formatEuro(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function statusLabel(status: ReservationStatus): string {
  switch (status) {
    case "PAID":
      return "Paiement confirme";
    case "PENDING":
      return "Paiement en attente";
    case "CANCELED":
      return "Paiement annule";
    case "FAILED":
      return "Paiement echoue";
    case "EXPIRED":
      return "Reservation expiree";
    default:
      return status;
  }
}

function statusTone(status: ReservationStatus): string {
  if (status === "PAID") {
    return "border-emerald-300 bg-emerald-50 text-emerald-900";
  }
  if (status === "PENDING") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  return "border-red-200 bg-red-50 text-red-800";
}

export default function InitiationPaymentStatus(props: {
  reservationId?: string;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ReservationView | null>(null);

  useEffect(() => {
    let active = true;

    const loadReservation = async () => {
      if (!props.reservationId) {
        if (active) {
          setIsLoading(false);
          setError("Reservation introuvable.");
        }
        return;
      }

      try {
        const response = await fetch(
          `/api/reservations/${props.reservationId}?sync=1`,
          { cache: "no-store" }
        );
        const data = (await response.json()) as ReservationApiResponse;

        if (!response.ok || !data.ok || !data.reservation) {
          throw new Error(data.error || "Reservation introuvable.");
        }

        if (!active) {
          return;
        }

        setReservation(data.reservation);
        setError(null);
      } catch (fetchError) {
        if (!active) {
          return;
        }
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Impossible de verifier le paiement."
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadReservation();
    const pollId = setInterval(() => {
      if (reservation?.status === "PENDING") {
        void loadReservation();
      }
    }, 8_000);

    return () => {
      active = false;
      clearInterval(pollId);
    };
  }, [props.reservationId, reservation?.status]);

  if (isLoading) {
    return <p className="text-sm text-emerald-900/70">Verification du paiement...</p>;
  }

  if (error || !reservation) {
    return (
      <div className="space-y-3">
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error || "Reservation introuvable."}
        </p>
        <Link
          className="inline-flex rounded-full border border-emerald-900/20 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
          href="/initiation/reservation"
        >
          Retour a la reservation
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border px-4 py-3 text-sm ${statusTone(reservation.status)}`}>
        <p className="font-semibold">{statusLabel(reservation.status)}</p>
      </div>

      <div className="rounded-2xl border border-emerald-900/10 bg-white p-4 text-sm text-emerald-900/80">
        <p>
          Reservation: <span className="font-semibold text-emerald-950">{reservation.id}</span>
        </p>
        {reservation.slot ? (
          <p>
            Creneau:{" "}
            <span className="font-semibold text-emerald-950">
              {reservation.slot.date} - {reservation.slot.startTime} /{" "}
              {reservation.slot.endTime}
            </span>
          </p>
        ) : null}
        <p>
          Participants:{" "}
          <span className="font-semibold text-emerald-950">
            {reservation.participantsCount}
          </span>
        </p>
        <p>
          Option repas:{" "}
          <span className="font-semibold text-emerald-950">
            {reservation.mealOption === "WITH_MEAL" ? "Avec repas" : "Sans repas"}
          </span>
        </p>
        <p className="text-base font-semibold text-emerald-950">
          Total: {formatEuro(reservation.totalPriceCents)}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full border border-emerald-900/20 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
          href="/initiation/reservation"
        >
          Nouvelle reservation
        </Link>
        {reservation.status !== "PAID" ? (
          <Link
            className="inline-flex rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800"
            href={`/payment/cancel?reservationId=${reservation.id}`}
          >
            Reessayer
          </Link>
        ) : null}
      </div>
    </div>
  );
}

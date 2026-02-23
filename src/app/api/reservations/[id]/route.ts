import { NextResponse } from "next/server";

import {
  expireReservationIfNeeded,
  getReservationById,
  setReservationStatus,
} from "@/lib/initiation/db";
import { getInitiationPaymentEnv } from "@/lib/initiation/env";
import {
  extractSumUpTransactionId,
  getCheckoutById,
  mapSumUpCheckoutToReservationStatus,
} from "@/lib/initiation/sumup";
import { isUuid } from "@/lib/initiation/validation";

type RouteParams = {
  params: Promise<{ id: string }>;
};

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "GET" } }
  );
}

function toPublicReservationView(
  reservation: NonNullable<Awaited<ReturnType<typeof getReservationById>>>
) {
  return {
    id: reservation.id,
    status: reservation.status,
    mealOption: reservation.mealOption,
    participantsCount: reservation.participantsCount,
    pricePerPersonCents: reservation.pricePerPersonCents,
    totalPriceCents: reservation.totalPriceCents,
    expiresAt: reservation.expiresAt,
    checkoutId: reservation.sumupCheckoutId,
    slot: reservation.slot,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
  };
}

export async function GET(request: Request, context: RouteParams) {
  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json(
      { ok: false, error: "Invalid reservation id." },
      { status: 400 }
    );
  }

  try {
    await expireReservationIfNeeded(id);
    let reservation = await getReservationById(id);

    if (!reservation) {
      return NextResponse.json(
        { ok: false, error: "Reservation not found." },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const shouldSync = url.searchParams.get("sync") === "1";

    if (
      shouldSync &&
      reservation.status === "PENDING" &&
      reservation.sumupCheckoutId
    ) {
      try {
        const env = getInitiationPaymentEnv();
        const checkout = await getCheckoutById({
          apiKey: env.sumupApiKey,
          apiBaseUrl: env.sumupApiBaseUrl,
          checkoutId: reservation.sumupCheckoutId,
        });

        const nextStatus = mapSumUpCheckoutToReservationStatus(checkout.status);
        const transactionId = extractSumUpTransactionId(checkout);

        if (nextStatus !== "PENDING") {
          await setReservationStatus({
            reservationId: reservation.id,
            status: nextStatus,
            sumupTransactionId: transactionId,
          });
          reservation = await getReservationById(id);
        }
      } catch (error) {
        console.error("[api/reservations/:id] sync failed", {
          reservationId: id,
          message: error instanceof Error ? error.message : "unknown error",
        });
      }
    }

    if (!reservation) {
      return NextResponse.json(
        { ok: false, error: "Reservation not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { ok: true, reservation: toPublicReservationView(reservation) },
      { status: 200 }
    );
  } catch (error) {
    console.error("[api/reservations/:id] failed", {
      reservationId: id,
      message: error instanceof Error ? error.message : "unknown error",
    });

    return NextResponse.json(
      { ok: false, error: "Failed to load reservation." },
      { status: 500 }
    );
  }
}

export function POST() {
  return methodNotAllowed();
}

export function PUT() {
  return methodNotAllowed();
}

export function PATCH() {
  return methodNotAllowed();
}

export function DELETE() {
  return methodNotAllowed();
}


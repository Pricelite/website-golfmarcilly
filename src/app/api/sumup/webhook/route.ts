import { NextResponse } from "next/server";

import {
  getReservationByCheckoutId,
  setReservationStatus,
} from "@/lib/initiation/db";
import { getInitiationPaymentEnv } from "@/lib/initiation/env";
import {
  extractSumUpTransactionId,
  getCheckoutById,
  mapSumUpCheckoutToReservationStatus,
} from "@/lib/initiation/sumup";

type SumUpWebhookPayload = {
  id?: string;
  checkout_id?: string;
  payload?: {
    id?: string;
    checkout_id?: string;
  };
  data?: {
    id?: string;
    checkout_id?: string;
  };
};

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}

function extractCheckoutId(payload: SumUpWebhookPayload): string | null {
  return (
    payload.checkout_id ||
    payload.id ||
    payload.payload?.checkout_id ||
    payload.payload?.id ||
    payload.data?.checkout_id ||
    payload.data?.id ||
    null
  );
}

export async function POST(request: Request) {
  let payload: SumUpWebhookPayload;

  try {
    payload = (await request.json()) as SumUpWebhookPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid webhook payload." },
      { status: 400 }
    );
  }

  const checkoutId = extractCheckoutId(payload);
  if (!checkoutId) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    const env = getInitiationPaymentEnv();
    const checkout = await getCheckoutById({
      apiKey: env.sumupApiKey,
      apiBaseUrl: env.sumupApiBaseUrl,
      checkoutId,
    });

    const reservation = await getReservationByCheckoutId(checkoutId);
    if (!reservation) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const nextStatus = mapSumUpCheckoutToReservationStatus(checkout.status);
    const transactionId = extractSumUpTransactionId(checkout);

    if (reservation.status !== "PAID" || nextStatus === "PAID") {
      await setReservationStatus({
        reservationId: reservation.id,
        status: nextStatus,
        sumupTransactionId: transactionId,
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("[api/sumup/webhook] failed", {
      checkoutId,
      message: error instanceof Error ? error.message : "unknown error",
    });
    return NextResponse.json(
      { ok: false, error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}

export function GET() {
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


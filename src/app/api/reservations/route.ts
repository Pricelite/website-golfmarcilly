import { NextResponse } from "next/server";

import { logApiError } from "@/lib/api/logging";
import { INITIATION_PENDING_TTL_MINUTES } from "@/lib/initiation/constants";
import { createGoogleCalendarReservation, hasGoogleCalendarEnv } from "@/lib/initiation/google-calendar";
import {
  createPendingReservation,
  setReservationCheckoutId,
  setReservationStatus,
} from "@/lib/initiation/db";
import { getInitiationPaymentEnv, hasInitiationPaymentEnv } from "@/lib/initiation/env";
import { createHostedCheckout, getCheckoutById } from "@/lib/initiation/sumup";
import { parseCreateReservationPayload } from "@/lib/initiation/validation";
import {
  consumeRateLimit,
  hasTrustedOrigin,
  parseClientIpFromHeaders,
} from "@/lib/security/request-guards";

const RESERVATION_RATE_LIMIT_MAX_REQUESTS = 10;
const RESERVATION_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function methodNotAllowed() {
  return NextResponse.json(
    { ok: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}

function getPendingExpirationIso(): string {
  return new Date(
    Date.now() + INITIATION_PENDING_TTL_MINUTES * 60 * 1000
  ).toISOString();
}

function createDescription(params: {
  date: string;
  startTime: string;
  participantsCount: number;
  mealOption: string;
}): string {
  const mealLabel =
    params.mealOption === "WITH_MEAL" ? "with meal" : "without meal";
  return `Initiation ${params.date} ${params.startTime} (${params.participantsCount} pax, ${mealLabel})`;
}

export async function POST(request: Request) {
  const fallbackHost = new URL(request.url).host;
  if (!hasTrustedOrigin(request.headers, { fallbackHost })) {
    return NextResponse.json(
      { ok: false, error: "Request origin is not trusted." },
      { status: 403 }
    );
  }

  const requesterIp = parseClientIpFromHeaders(request.headers);
  const rateLimit = consumeRateLimit({
    namespace: "initiation-reservation",
    identifier: requesterIp,
    limit: RESERVATION_RATE_LIMIT_MAX_REQUESTS,
    windowMs: RESERVATION_RATE_LIMIT_WINDOW_MS,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const parsed = parseCreateReservationPayload(payload);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400 }
    );
  }

  const expiresAt = getPendingExpirationIso();
  const useGoogleCalendarDirect =
    hasGoogleCalendarEnv() && !hasInitiationPaymentEnv();

  if (useGoogleCalendarDirect) {
    try {
      const event = await createGoogleCalendarReservation({
        date: parsed.data.date,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        participantsCount: parsed.data.participantsCount,
        mealOption: parsed.data.mealOption,
      });

      return NextResponse.json(
        {
          ok: true,
          reservationId: event.eventId,
          calendarEventUrl: event.htmlLink,
          message:
            "Reservation confirmee dans l'agenda initiation. Le paiement SumUp sera integre ensuite.",
        },
        { status: 201 }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      const missingEnvMatch =
        typeof message === "string"
          ? /Missing required env var:\s*([A-Z0-9_,\s]+)/.exec(message)
          : null;
      if (message.includes("CAPACITY_EXCEEDED")) {
        return NextResponse.json(
          { ok: false, error: "Not enough seats remaining on this slot." },
          { status: 409 }
        );
      }
      if (missingEnvMatch) {
        return NextResponse.json(
          {
            ok: false,
            error: `Server configuration is incomplete. Missing env var: ${missingEnvMatch[1].trim()}.`,
          },
          { status: 503 }
        );
      }

      logApiError("api/reservations", "google_reservation_failed", {
        mode: "google-direct",
        message,
      });
      return NextResponse.json(
        { ok: false, error: "Failed to create reservation in Google Calendar." },
        { status: 500 }
      );
    }
  }

  try {
    const reservation = await createPendingReservation({
      date: parsed.data.date,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      participantsCount: parsed.data.participantsCount,
      mealOption: parsed.data.mealOption,
      pricePerPersonCents: parsed.data.pricePerPersonCents,
      totalPriceCents: parsed.data.totalPriceCents,
      expiresAtIso: expiresAt,
    });

    const env = getInitiationPaymentEnv();

    if (reservation.sumupCheckoutId) {
      console.error("[api/reservations] checkout_reused", {
        reservationId: reservation.id,
        checkoutId: reservation.sumupCheckoutId,
      });
      const existingCheckout = await getCheckoutById({
        apiKey: env.sumupApiKey,
        apiBaseUrl: env.sumupApiBaseUrl,
        checkoutId: reservation.sumupCheckoutId,
      });

      if (existingCheckout.id && existingCheckout.hosted_checkout_url) {
        console.error("[api/reservations] reservation_created", {
          reservationId: reservation.id,
          checkoutId: existingCheckout.id,
          mode: "supabase-sumup-reused",
        });
        return NextResponse.json(
          {
            ok: true,
            reservationId: reservation.id,
            checkoutId: existingCheckout.id,
            checkoutUrl: existingCheckout.hosted_checkout_url,
            expiresAt: reservation.expiresAt,
          },
          { status: 201 }
        );
      }

      return NextResponse.json(
        { ok: false, error: "Existing payment checkout could not be loaded." },
        { status: 502 }
      );
    }

    const returnUrl = `${env.appBaseUrl}/payment/success?reservationId=${reservation.id}`;
    const checkout = await createHostedCheckout({
      apiKey: env.sumupApiKey,
      apiBaseUrl: env.sumupApiBaseUrl,
      merchantCode: env.sumupMerchantCode,
      reservationId: reservation.id,
      description: createDescription({
        date: parsed.data.date,
        startTime: parsed.data.startTime,
        participantsCount: parsed.data.participantsCount,
        mealOption: parsed.data.mealOption,
      }),
      totalPriceCents: reservation.totalPriceCents,
      returnUrl,
    });

    if (!checkout.id || !checkout.hosted_checkout_url) {
      await setReservationStatus({
        reservationId: reservation.id,
        status: "FAILED",
      });

      return NextResponse.json(
        { ok: false, error: "Payment checkout could not be created." },
        { status: 502 }
      );
    }

    await setReservationCheckoutId({
      reservationId: reservation.id,
      checkoutId: checkout.id,
    });

    console.error("[api/reservations] reservation_created", {
      reservationId: reservation.id,
      checkoutId: checkout.id,
      mode: "supabase-sumup",
    });

    return NextResponse.json(
      {
        ok: true,
        reservationId: reservation.id,
        checkoutId: checkout.id,
        checkoutUrl: checkout.hosted_checkout_url,
        expiresAt: reservation.expiresAt,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    const missingEnvMatch =
      typeof message === "string"
        ? /Missing required env var:\s*([A-Z0-9_]+)/.exec(message)
        : null;

    if (message.includes("CAPACITY_EXCEEDED")) {
      return NextResponse.json(
        { ok: false, error: "Not enough seats remaining on this slot." },
        { status: 409 }
      );
    }

    if (missingEnvMatch) {
      return NextResponse.json(
        {
          ok: false,
          error: `Server configuration is incomplete. Missing env var: ${missingEnvMatch[1]}.`,
        },
        { status: 503 }
      );
    }

    logApiError("api/reservations", "reservation_failed", {
      mode: useGoogleCalendarDirect ? "google-direct" : "supabase-sumup",
      message,
    });
    return NextResponse.json(
      { ok: false, error: "Failed to create reservation." },
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

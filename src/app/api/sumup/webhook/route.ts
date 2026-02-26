import { createHmac, timingSafeEqual } from "node:crypto";

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

const SIGNATURE_HEADERS = [
  "x-sumup-signature",
  "sumup-signature",
  "x-signature",
] as const;

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

function safeEqual(value: string, expected: string): boolean {
  const valueBuffer = Buffer.from(value);
  const expectedBuffer = Buffer.from(expected);

  if (valueBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(valueBuffer, expectedBuffer);
}

function getSignatureCandidates(headers: Headers): string[] {
  const rawValues = SIGNATURE_HEADERS.map((header) => headers.get(header)).filter(
    (value): value is string => Boolean(value && value.trim())
  );

  const candidates = new Set<string>();

  for (const rawValue of rawValues) {
    const parts = rawValue.split(/[,\s]/).map((part) => part.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes("=")) {
        const [key, value] = part.split("=", 2);
        const normalizedKey = key.trim().toLowerCase();
        const normalizedValue = value.trim();

        if (normalizedKey === "sha256" || normalizedKey === "v1" || normalizedKey === "signature") {
          candidates.add(normalizedValue);
          continue;
        }

        candidates.add(normalizedValue);
        continue;
      }

      candidates.add(part);
    }
  }

  return [...candidates];
}

function isValidWebhookSignature(
  rawBody: string,
  headers: Headers,
  webhookSecret: string
): boolean {
  const candidates = getSignatureCandidates(headers);
  if (candidates.length === 0) {
    return false;
  }

  const digestHex = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const digestBase64 = createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("base64");

  return candidates.some((candidate) => {
    const normalized = candidate.trim();

    if (!normalized) {
      return false;
    }

    return safeEqual(normalized, digestHex) || safeEqual(normalized, digestBase64);
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.SUMUP_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Webhook secret missing. Configure SUMUP_WEBHOOK_SECRET before enabling this endpoint.",
      },
      { status: 503 }
    );
  }

  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid webhook payload." },
      { status: 400 }
    );
  }

  if (!isValidWebhookSignature(rawBody, request.headers, webhookSecret)) {
    return NextResponse.json(
      { ok: false, error: "Invalid webhook signature." },
      { status: 401 }
    );
  }

  let payload: SumUpWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as SumUpWebhookPayload;
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

import "server-only";

import type { InitiationReservationStatus } from "./types";

export type SumUpCheckout = {
  id: string;
  checkout_reference?: string;
  amount?: number;
  currency?: string;
  status?: string;
  hosted_checkout_url?: string;
  transactions?: Array<{
    id?: string;
    status?: string;
  }>;
};

type SumUpRequestOptions = {
  method: "GET" | "POST";
  path: string;
  apiKey: string;
  apiBaseUrl: string;
  body?: unknown;
};

export type CreateHostedCheckoutInput = {
  apiKey: string;
  apiBaseUrl: string;
  merchantCode: string;
  reservationId: string;
  description: string;
  totalPriceCents: number;
  returnUrl: string;
};

async function sumupRequest<T>(options: SumUpRequestOptions): Promise<T> {
  const response = await fetch(`${options.apiBaseUrl}${options.path}`, {
    method: options.method,
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `SumUp request failed (${response.status}): ${body.slice(0, 300)}`
    );
  }

  return (await response.json()) as T;
}

export async function createHostedCheckout(
  input: CreateHostedCheckoutInput
): Promise<SumUpCheckout> {
  const payload = {
    checkout_reference: input.reservationId,
    amount: Number((input.totalPriceCents / 100).toFixed(2)),
    currency: "EUR",
    merchant_code: input.merchantCode,
    description: input.description,
    return_url: input.returnUrl,
    hosted_checkout: {
      enabled: true,
    },
  };

  return sumupRequest<SumUpCheckout>({
    method: "POST",
    path: "/v0.1/checkouts",
    apiKey: input.apiKey,
    apiBaseUrl: input.apiBaseUrl,
    body: payload,
  });
}

export async function getCheckoutById(options: {
  apiKey: string;
  apiBaseUrl: string;
  checkoutId: string;
}): Promise<SumUpCheckout> {
  return sumupRequest<SumUpCheckout>({
    method: "GET",
    path: `/v0.1/checkouts/${encodeURIComponent(options.checkoutId)}`,
    apiKey: options.apiKey,
    apiBaseUrl: options.apiBaseUrl,
  });
}

export function mapSumUpCheckoutToReservationStatus(
  checkoutStatus: string | undefined
): InitiationReservationStatus {
  switch ((checkoutStatus || "").toUpperCase()) {
    case "PAID":
      return "PAID";
    case "CANCELED":
    case "CANCELLED":
      return "CANCELED";
    case "FAILED":
      return "FAILED";
    case "EXPIRED":
      return "EXPIRED";
    default:
      return "PENDING";
  }
}

export function extractSumUpTransactionId(
  checkout: SumUpCheckout
): string | null {
  const firstId = checkout.transactions?.find((item) => item.id)?.id;
  return firstId || null;
}


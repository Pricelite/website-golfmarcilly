import "server-only";

import { INITIATION_SLOT_CAPACITY } from "./constants";
import type {
  InitiationMealOption,
  InitiationReservation,
  InitiationReservationStatus,
  InitiationSlot,
} from "./types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SessionSlotRow = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
};

type ReservationRow = {
  id: string;
  slot_id: string;
  full_name: string;
  email: string;
  phone: string;
  participants_count: number;
  meal_option: InitiationMealOption;
  price_per_person_cents: number;
  total_price_cents: number;
  status: InitiationReservationStatus;
  sumup_checkout_id: string | null;
  sumup_transaction_id: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string;
};

type ReservationWithSlotRow = ReservationRow & {
  slot: SessionSlotRow | SessionSlotRow[] | null;
};

export type InitiationReservationWithSlot = InitiationReservation & {
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
  } | null;
};

type CreatePendingReservationInput = {
  date: string;
  startTime: string;
  endTime: string;
  fullName: string;
  email: string;
  phone: string;
  participantsCount: number;
  mealOption: InitiationMealOption;
  pricePerPersonCents: number;
  totalPriceCents: number;
  expiresAtIso: string;
};

function normalizeTime(value: string): string {
  return value.slice(0, 5);
}

function mapReservation(row: ReservationRow): InitiationReservation {
  return {
    id: row.id,
    slotId: row.slot_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    participantsCount: row.participants_count,
    mealOption: row.meal_option,
    pricePerPersonCents: row.price_per_person_cents,
    totalPriceCents: row.total_price_cents,
    status: row.status,
    sumupCheckoutId: row.sumup_checkout_id,
    sumupTransactionId: row.sumup_transaction_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
  };
}

function mapReservationWithSlot(
  row: ReservationWithSlotRow
): InitiationReservationWithSlot {
  const slotValue = Array.isArray(row.slot) ? row.slot[0] || null : row.slot;

  return {
    ...mapReservation(row),
    slot: slotValue
      ? {
          id: slotValue.id,
          date: slotValue.date,
          startTime: normalizeTime(slotValue.start_time),
          endTime: normalizeTime(slotValue.end_time),
          capacity: slotValue.capacity,
        }
      : null,
  };
}

function slotKey(date: string, startTime: string, endTime: string): string {
  return `${date}|${startTime}|${endTime}`;
}

export async function ensureAndListSlotAvailability(params: {
  slots: Array<{ date: string; startTime: string; endTime: string }>;
}): Promise<InitiationSlot[]> {
  if (params.slots.length === 0) {
    return [];
  }

  const supabase = createSupabaseAdminClient();
  const upsertRows = params.slots.map((slot) => ({
    date: slot.date,
    start_time: slot.startTime,
    end_time: slot.endTime,
    capacity: INITIATION_SLOT_CAPACITY,
  }));

  const { error: upsertError } = await supabase
    .from("initiation_session_slots")
    .upsert(upsertRows, { onConflict: "date,start_time,end_time" });

  if (upsertError) {
    throw new Error(`Failed to upsert slots: ${upsertError.message}`);
  }

  const dates = params.slots.map((slot) => slot.date);
  const minDate = dates.reduce((a, b) => (a < b ? a : b));
  const maxDate = dates.reduce((a, b) => (a > b ? a : b));
  const requestedSet = new Set(
    params.slots.map((slot) => slotKey(slot.date, slot.startTime, slot.endTime))
  );

  const { data: slotRows, error: slotError } = await supabase
    .from("initiation_session_slots")
    .select("id,date,start_time,end_time,capacity")
    .gte("date", minDate)
    .lte("date", maxDate)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (slotError) {
    throw new Error(`Failed to fetch slots: ${slotError.message}`);
  }

  const scopedSlotRows = ((slotRows as SessionSlotRow[] | null) || []).filter(
    (row) => requestedSet.has(slotKey(row.date, normalizeTime(row.start_time), normalizeTime(row.end_time)))
  );

  const slotIds = scopedSlotRows.map((slot) => slot.id);
  const nowIso = new Date().toISOString();
  const reservationsBySlot = new Map<string, number>();

  if (slotIds.length > 0) {
    const { data: reservationRows, error: reservationError } = await supabase
      .from("initiation_reservations")
      .select("slot_id,participants_count,status,expires_at")
      .in("slot_id", slotIds)
      .in("status", ["PENDING", "PAID"]);

    if (reservationError) {
      throw new Error(
        `Failed to fetch slot reservations: ${reservationError.message}`
      );
    }

    for (const row of (reservationRows as Array<{
      slot_id: string;
      participants_count: number;
      status: InitiationReservationStatus;
      expires_at: string;
    }> | null) || []) {
      const isCounted =
        row.status === "PAID" ||
        (row.status === "PENDING" && row.expires_at > nowIso);
      if (!isCounted) {
        continue;
      }

      const current = reservationsBySlot.get(row.slot_id) || 0;
      reservationsBySlot.set(row.slot_id, current + row.participants_count);
    }
  }

  return scopedSlotRows.map((slot) => {
    const startTime = normalizeTime(slot.start_time);
    const endTime = normalizeTime(slot.end_time);
    const reservedSeats = reservationsBySlot.get(slot.id) || 0;
    const remainingSeats = Math.max(0, slot.capacity - reservedSeats);

    return {
      id: slot.id,
      date: slot.date,
      startTime,
      endTime,
      capacity: slot.capacity,
      reservedSeats,
      remainingSeats,
    };
  });
}

export async function createPendingReservation(
  input: CreatePendingReservationInput
): Promise<InitiationReservation> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.rpc("create_initiation_reservation", {
    p_date: input.date,
    p_start_time: input.startTime,
    p_end_time: input.endTime,
    p_full_name: input.fullName,
    p_email: input.email,
    p_phone: input.phone,
    p_participants_count: input.participantsCount,
    p_meal_option: input.mealOption,
    p_price_per_person_cents: input.pricePerPersonCents,
    p_total_price_cents: input.totalPriceCents,
    p_expires_at: input.expiresAtIso,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = (Array.isArray(data) ? data[0] : data) as ReservationRow | null;
  if (!row) {
    throw new Error("Reservation was not created.");
  }

  return mapReservation(row);
}

export async function getReservationById(
  reservationId: string
): Promise<InitiationReservationWithSlot | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("initiation_reservations")
    .select(
      `
        id,
        slot_id,
        full_name,
        email,
        phone,
        participants_count,
        meal_option,
        price_per_person_cents,
        total_price_cents,
        status,
        sumup_checkout_id,
        sumup_transaction_id,
        created_at,
        updated_at,
        expires_at,
        slot:initiation_session_slots (
          id,
          date,
          start_time,
          end_time,
          capacity
        )
      `
    )
    .eq("id", reservationId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get reservation: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapReservationWithSlot(data as ReservationWithSlotRow);
}

export async function getReservationByCheckoutId(
  checkoutId: string
): Promise<InitiationReservationWithSlot | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("initiation_reservations")
    .select(
      `
        id,
        slot_id,
        full_name,
        email,
        phone,
        participants_count,
        meal_option,
        price_per_person_cents,
        total_price_cents,
        status,
        sumup_checkout_id,
        sumup_transaction_id,
        created_at,
        updated_at,
        expires_at,
        slot:initiation_session_slots (
          id,
          date,
          start_time,
          end_time,
          capacity
        )
      `
    )
    .eq("sumup_checkout_id", checkoutId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get checkout reservation: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapReservationWithSlot(data as ReservationWithSlotRow);
}

export async function setReservationCheckoutId(params: {
  reservationId: string;
  checkoutId: string;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("initiation_reservations")
    .update({ sumup_checkout_id: params.checkoutId })
    .eq("id", params.reservationId);

  if (error) {
    throw new Error(`Failed to set checkout id: ${error.message}`);
  }
}

export async function setReservationStatus(params: {
  reservationId: string;
  status: InitiationReservationStatus;
  sumupTransactionId?: string | null;
}): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const payload: {
    status: InitiationReservationStatus;
    sumup_transaction_id?: string | null;
  } = { status: params.status };

  if (params.sumupTransactionId !== undefined) {
    payload.sumup_transaction_id = params.sumupTransactionId;
  }

  const { error } = await supabase
    .from("initiation_reservations")
    .update(payload)
    .eq("id", params.reservationId);

  if (error) {
    throw new Error(`Failed to update reservation status: ${error.message}`);
  }
}

export async function expireReservationIfNeeded(
  reservationId: string
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("initiation_reservations")
    .update({ status: "EXPIRED" satisfies InitiationReservationStatus })
    .eq("id", reservationId)
    .eq("status", "PENDING")
    .lte("expires_at", new Date().toISOString());

  if (error) {
    throw new Error(`Failed to expire reservation: ${error.message}`);
  }
}

export async function markExpiredPendingReservations(): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("initiation_reservations")
    .update({ status: "EXPIRED" satisfies InitiationReservationStatus })
    .eq("status", "PENDING")
    .lte("expires_at", new Date().toISOString());

  if (error) {
    throw new Error(`Failed to expire pending reservations: ${error.message}`);
  }
}

export async function listReservationsForAdmin(): Promise<
  InitiationReservationWithSlot[]
> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("initiation_reservations")
    .select(
      `
        id,
        slot_id,
        full_name,
        email,
        phone,
        participants_count,
        meal_option,
        price_per_person_cents,
        total_price_cents,
        status,
        sumup_checkout_id,
        sumup_transaction_id,
        created_at,
        updated_at,
        expires_at,
        slot:initiation_session_slots (
          id,
          date,
          start_time,
          end_time,
          capacity
        )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list reservations: ${error.message}`);
  }

  return ((data as ReservationWithSlotRow[] | null) || []).map(
    mapReservationWithSlot
  );
}

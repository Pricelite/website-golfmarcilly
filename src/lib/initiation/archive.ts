import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ArchivedReservation = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  participants_count: number;
  meal_option: "WITH_MEAL" | "WITHOUT_MEAL";
  status: string;
  created_at: string;
  slot: { date: string; start_time: string; end_time: string } | { date: string; start_time: string; end_time: string }[] | null;
};

export const ARCHIVE_PAGE_SIZE = 50;

export async function listArchivedReservations(page: number): Promise<{ reservations: ArchivedReservation[]; total: number }> {
  const from = (page - 1) * ARCHIVE_PAGE_SIZE;
  const { data, count, error } = await createSupabaseAdminClient()
    .from("initiation_reservations")
    .select("id,full_name,email,phone,participants_count,meal_option,status,created_at,slot:initiation_session_slots(date,start_time,end_time)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + ARCHIVE_PAGE_SIZE - 1);

  if (error) throw new Error("Les archives des initiations sont indisponibles.");
  return { reservations: (data ?? []) as ArchivedReservation[], total: count ?? 0 };
}

import type { Metadata } from "next";

import InitiationRequestForm from "@/app/initiation/reservation/initiation-request-form";

type SlotTemplate = {
  weekday: number;
  startLabel: string;
  endLabel: string;
  coach: string;
};

type SlotOption = {
  value: string;
  label: string;
};

const SLOT_TEMPLATES: readonly SlotTemplate[] = [
  { weekday: 4, startLabel: "11H00", endLabel: "12H00", coach: "Adrien" },
  { weekday: 5, startLabel: "11H00", endLabel: "12H00", coach: "Adrien" },
  { weekday: 6, startLabel: "11H00", endLabel: "12H00", coach: "Baptiste" },
  { weekday: 6, startLabel: "15H00", endLabel: "16H00", coach: "Adrien" },
  { weekday: 0, startLabel: "11H00", endLabel: "12H00", coach: "Adrien" },
];

export const metadata: Metadata = {
  title: "Reservation initiation | Golf de Marcilly",
  description: "Contactez-nous pour reserver votre initiation.",
};

function normalizeUtcDay(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  );
}

function addUtcDays(value: Date, days: number): Date {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toIsoDate(value: Date): string {
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildSlotOptions(startDate: Date, endDate: Date): SlotOption[] {
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
  const slots: SlotOption[] = [];

  for (
    let cursor = normalizeUtcDay(startDate);
    cursor <= endDate;
    cursor = addUtcDays(cursor, 1)
  ) {
    const weekday = cursor.getUTCDay();
    const isoDate = toIsoDate(cursor);
    const dateLabel = dateFormatter.format(cursor);

    for (const template of SLOT_TEMPLATES) {
      if (template.weekday !== weekday) {
        continue;
      }

      slots.push({
        value: `${isoDate}|${template.startLabel}-${template.endLabel}|${template.coach}`,
        label: `${dateLabel} - ${template.startLabel} a ${template.endLabel} (${template.coach})`,
      });
    }
  }

  return slots;
}

export default function InitiationReservationPage() {
  const todayUtc = normalizeUtcDay(new Date());
  const sevenDaysEndDate = addUtcDays(todayUtc, 6);
  const year2026StartDate = new Date(Date.UTC(2026, 0, 1));
  const year2026EndDate = new Date(Date.UTC(2026, 11, 31));
  const next7DaysSlots = buildSlotOptions(todayUtc, sevenDaysEndDate);
  const fullYearSlots = buildSlotOptions(year2026StartDate, year2026EndDate);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <section className="rounded-3xl border border-emerald-900/10 bg-white/80 p-7 shadow-xl shadow-emerald-900/10">
        <h1 className="font-[var(--font-display)] text-3xl text-emerald-950">
          Reservation initiation
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-emerald-900/75">
          Contactez-nous directement pour reserver votre initiation.
        </p>
      </section>

      <section className="mt-7 rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-lg shadow-emerald-900/10">
        <h2 className="text-xl font-semibold text-emerald-950">Reservation</h2>
        <p className="mt-2 text-sm text-emerald-900/75">
          Envoyez votre demande et nous vous proposerons un creneau.
        </p>
        <InitiationRequestForm
          next7DaysSlots={next7DaysSlots}
          fullYearSlots={fullYearSlots}
        />
      </section>
    </main>
  );
}

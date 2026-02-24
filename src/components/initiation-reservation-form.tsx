"use client";

import { useEffect, useMemo, useState } from "react";

import { INITIATION_SLOT_CAPACITY } from "@/lib/initiation/constants";
import type { InitiationMealOption, InitiationSlot } from "@/lib/initiation/types";

type SlotsApiResponse = {
  ok: boolean;
  error?: string;
  slots?: InitiationSlot[];
};

type CreateReservationApiResponse = {
  ok: boolean;
  error?: string;
  checkoutUrl?: string;
  reservationId?: string;
  calendarEventUrl?: string;
  message?: string;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  participantsCount: number;
  mealOption: InitiationMealOption | null;
  selectedSlotId: string | null;
};

const SLOT_REFRESH_INTERVAL_MS = 30_000;

function formatDateLabel(value: string): string {
  const [yearRaw, monthRaw, dayRaw] = value.split("-");
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getMealPriceCents(mealOption: InitiationMealOption | null): number {
  if (mealOption === "WITH_MEAL") {
    return 4800;
  }
  if (mealOption === "WITHOUT_MEAL") {
    return 2500;
  }
  return 0;
}

function formatEuro(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default function InitiationReservationForm(props: {
  initialMealOption?: InitiationMealOption;
}) {
  const [slots, setSlots] = useState<InitiationSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitSuccessLink, setSubmitSuccessLink] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    participantsCount: 1,
    mealOption: props.initialMealOption ?? null,
    selectedSlotId: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadSlots = async () => {
      try {
        const response = await fetch("/api/slots", { cache: "no-store" });
        const data = (await response.json()) as SlotsApiResponse;

        if (!response.ok || !data.ok || !data.slots) {
          throw new Error(data.error || "Unable to load slots.");
        }

        if (!isMounted) {
          return;
        }

        setSlots(data.slots);
        setSlotsError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setSlotsError(
          error instanceof Error ? error.message : "Unable to load slots."
        );
      } finally {
        if (isMounted) {
          setIsLoadingSlots(false);
        }
      }
    };

    void loadSlots();
    const intervalId = setInterval(() => {
      void loadSlots();
    }, SLOT_REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!form.selectedSlotId) {
      return;
    }

    const selectedSlot = slots.find((slot) => slot.id === form.selectedSlotId);
    if (!selectedSlot) {
      setForm((current) => ({ ...current, selectedSlotId: null }));
      return;
    }

    if (selectedSlot.remainingSeats < form.participantsCount) {
      setForm((current) => ({
        ...current,
        participantsCount: Math.max(1, selectedSlot.remainingSeats),
      }));
    }
  }, [form.participantsCount, form.selectedSlotId, slots]);

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, InitiationSlot[]>();
    for (const slot of slots) {
      const list = grouped.get(slot.date) || [];
      list.push(slot);
      grouped.set(slot.date, list);
    }
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [slots]);

  const selectedSlot = slots.find((slot) => slot.id === form.selectedSlotId) || null;
  const pricePerPersonCents = getMealPriceCents(form.mealOption);
  const totalPriceCents = form.participantsCount * pricePerPersonCents;

  const maxParticipants = selectedSlot
    ? Math.max(1, selectedSlot.remainingSeats)
    : INITIATION_SLOT_CAPACITY;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitSuccessLink(null);

    if (!selectedSlot) {
      setSubmitError("Merci de choisir un creneau.");
      return;
    }

    if (!form.mealOption) {
      setSubmitError("Merci de choisir l'option repas.");
      return;
    }

    if (selectedSlot.remainingSeats < form.participantsCount) {
      setSubmitError("Le nombre de places restantes est insuffisant.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          participantsCount: form.participantsCount,
          mealOption: form.mealOption,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        }),
      });

      const data = (await response.json()) as CreateReservationApiResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Reservation failed.");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setSubmitSuccess(
        data.message || "Reservation confirmee. Vous recevrez la confirmation sous peu."
      );
      setSubmitSuccessLink(data.calendarEventUrl || null);
      setIsSubmitting(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "La reservation a echoue. Merci de reessayer."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-lg shadow-emerald-900/10">
        <h2 className="text-xl font-semibold text-emerald-950">1. Choisir un creneau</h2>
        <p className="mt-2 text-sm text-emerald-900/70">
          Reservation disponible uniquement sur les 7 prochains jours.
        </p>

        {isLoadingSlots ? (
          <p className="mt-4 text-sm text-emerald-900/70">Chargement des creneaux...</p>
        ) : null}

        {slotsError ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {slotsError}
          </p>
        ) : null}

        {!isLoadingSlots && !slotsError && slotsByDate.length === 0 ? (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Aucun creneau disponible pour le moment. Merci de revenir plus tard.
          </p>
        ) : null}

        {!isLoadingSlots && !slotsError && slotsByDate.length > 0 ? (
          selectedSlot ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Creneau selectionne : {formatDateLabel(selectedSlot.date)} - {selectedSlot.startTime} a{" "}
              {selectedSlot.endTime}
            </p>
          ) : (
            <p className="mt-4 text-sm text-emerald-900/70">
              {"Cliquez sur \"Reserver ce creneau\" pour passer a l'etape suivante."}
            </p>
          )
        ) : null}

        <div className="mt-5 space-y-5">
          {slotsByDate.map(([date, dateSlots]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-900/80">
                {formatDateLabel(date)}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {dateSlots.map((slot) => {
                  const isSelected = slot.id === form.selectedSlotId;
                  const isFull = slot.remainingSeats <= 0;

                  return (
                    <article
                      key={slot.id}
                      className={`rounded-2xl border px-4 py-3 transition ${
                        isSelected
                          ? "border-emerald-700 bg-emerald-50 shadow-sm"
                          : "border-emerald-900/15 bg-white hover:border-emerald-700/50"
                      } ${isFull ? "opacity-70 hover:border-emerald-900/15" : ""}`}
                    >
                      <p className="text-sm font-semibold text-emerald-950">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="mt-1 text-xs text-emerald-900/75">
                        Places restantes: {slot.remainingSeats}/{slot.capacity}
                      </p>
                      <div className="mt-3">
                        <button
                          type="button"
                          disabled={isFull}
                          onClick={() => {
                            setForm((current) => ({
                              ...current,
                              selectedSlotId: slot.id,
                              participantsCount: Math.min(
                                current.participantsCount,
                                Math.max(1, slot.remainingSeats)
                              ),
                            }));
                          }}
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            isFull
                              ? "cursor-not-allowed bg-slate-100 text-slate-600"
                              : isSelected
                                ? "bg-emerald-900 text-emerald-50"
                                : "bg-white text-emerald-900 ring-1 ring-emerald-900/20 hover:bg-emerald-50"
                          }`}
                        >
                          {isFull
                            ? "Complet"
                            : isSelected
                              ? "Creneau selectionne"
                              : "Reserver ce creneau"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-lg shadow-emerald-900/10">
        <h2 className="text-xl font-semibold text-emerald-950">2. Vos informations</h2>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-emerald-900/85">
              Nom et prenom
              <input
                required
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fullName: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                type="text"
                maxLength={120}
              />
            </label>

            <label className="text-sm text-emerald-900/85">
              Email
              <input
                required
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                type="email"
                maxLength={160}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-emerald-900/85">
              Telephone
              <input
                required
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: event.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                type="tel"
                maxLength={30}
              />
            </label>

            <label className="text-sm text-emerald-900/85">
              Participants
              <select
                required
                value={form.participantsCount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    participantsCount: Number.parseInt(event.target.value, 10),
                  }))
                }
                className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                {Array.from({ length: maxParticipants }, (_, index) => index + 1).map(
                  (count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-emerald-950">
              Option repas (obligatoire)
            </legend>
            <label className="flex items-center gap-2 text-sm text-emerald-900/85">
              <input
                type="radio"
                name="mealOption"
                value="WITHOUT_MEAL"
                checked={form.mealOption === "WITHOUT_MEAL"}
                onChange={() =>
                  setForm((current) => ({ ...current, mealOption: "WITHOUT_MEAL" }))
                }
              />
              Sans repas (25,00 EUR / personne)
            </label>
            <label className="flex items-center gap-2 text-sm text-emerald-900/85">
              <input
                type="radio"
                name="mealOption"
                value="WITH_MEAL"
                checked={form.mealOption === "WITH_MEAL"}
                onChange={() =>
                  setForm((current) => ({ ...current, mealOption: "WITH_MEAL" }))
                }
              />
              Avec repas (48,00 EUR / personne)
            </label>
          </fieldset>

          <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-4 text-sm text-emerald-950">
            <p>
              Prix unitaire:{" "}
              <span className="font-semibold">
                {pricePerPersonCents > 0 ? formatEuro(pricePerPersonCents) : "--"}
              </span>
            </p>
            <p>
              Participants: <span className="font-semibold">{form.participantsCount}</span>
            </p>
            <p className="text-base font-semibold">
              Total: {pricePerPersonCents > 0 ? formatEuro(totalPriceCents) : "--"}
            </p>
          </div>

          {submitError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {submitError}
            </p>
          ) : null}

          {submitSuccess ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              {submitSuccess}
              {submitSuccessLink ? (
                <>
                  {" "}
                  <a
                    href={submitSuccessLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    Voir l\u2019\u00e9v\u00e9nement
                  </a>
                </>
              ) : null}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Traitement en cours..." : "Valider la reservation"}
          </button>
        </form>
      </section>
    </div>
  );
}

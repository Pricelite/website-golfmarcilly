"use client";

import { useEffect, useMemo, useState } from "react";

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  remainingSeats: number;
  capacity: number;
};

type SlotsApiResponse = {
  ok: boolean;
  error?: string;
  slots?: Slot[];
};

type ReservationApiResponse = {
  ok: boolean;
  error?: string;
  reservationId?: string;
  checkoutUrl?: string;
  calendarEventUrl?: string;
  message?: string;
};

type MealOption = "WITH_MEAL" | "WITHOUT_MEAL";

const mealLabels: Record<MealOption, string> = {
  WITH_MEAL: "Avec repas - 48 € / personne",
  WITHOUT_MEAL: "Sans repas - 25 € / personne",
};

const priceByMealOption: Record<MealOption, number> = {
  WITH_MEAL: 48,
  WITHOUT_MEAL: 25,
};

function formatSlotDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, day));
}

export default function InitiationReservationForm() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [calendarEventUrl, setCalendarEventUrl] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [participantsCount, setParticipantsCount] = useState("1");
  const [mealOption, setMealOption] = useState<MealOption>("WITHOUT_MEAL");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/slots", { cache: "no-store" });
        const data = (await response.json()) as SlotsApiResponse;

        if (!response.ok || !data.ok || !data.slots) {
          throw new Error(data.error || "Impossible de charger les créneaux.");
        }

        setSlots(data.slots.filter((slot) => slot.remainingSeats > 0));
        setSlotsError(null);
      } catch (error) {
        setSlotsError(
          error instanceof Error
            ? error.message
            : "Impossible de charger les créneaux."
        );
      } finally {
        setSlotsLoading(false);
      }
    })();
  }, []);

  const groupedSlots = useMemo(() => {
    const groups = new Map<string, Slot[]>();

    for (const slot of slots) {
      const current = groups.get(slot.date) || [];
      current.push(slot);
      groups.set(slot.date, current);
    }

    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [slots]);

  const selectedSlot =
    slots.find((slot) => slot.id === selectedSlotId) ?? null;
  const participants = Number.parseInt(participantsCount, 10) || 0;
  const total =
    participants > 0 ? participants * priceByMealOption[mealOption] : 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    setCalendarEventUrl(null);

    if (!selectedSlot) {
      setSubmitError("Merci de choisir un créneau.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          fullName,
          email,
          phone,
          participantsCount: participants,
          mealOption,
        }),
      });

      const data = (await response.json()) as ReservationApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Impossible de créer la réservation.");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setSuccessMessage(
        data.message ||
          "Votre réservation a bien été enregistrée."
      );
      setCalendarEventUrl(data.calendarEventUrl || null);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Impossible de créer la réservation."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[32px] border border-emerald-900/10 bg-white/90 p-8 shadow-xl shadow-emerald-900/10">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
          Étape 1
        </p>
        <h2 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
          Choisir un créneau
        </h2>
        <p className="mt-3 text-sm leading-7 text-emerald-900/75">
          Les initiations sont proposées sur les prochains week-ends. Sélectionnez
          une date puis l&apos;horaire qui vous convient.
        </p>

        {slotsLoading ? (
          <p className="mt-6 text-sm text-emerald-900/70">
            Chargement des créneaux...
          </p>
        ) : null}

        {slotsError ? (
          <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {slotsError}
          </p>
        ) : null}

        {!slotsLoading && !slotsError ? (
          <div className="mt-6 space-y-5">
            {groupedSlots.length === 0 ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Aucun créneau disponible pour le moment.
              </p>
            ) : null}

            {groupedSlots.map(([date, daySlots]) => (
              <div key={date} className="rounded-2xl border border-emerald-900/10 p-4">
                <p className="font-semibold capitalize text-emerald-950">
                  {formatSlotDate(date)}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {daySlots.map((slot) => {
                    const isSelected = slot.id === selectedSlotId;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`rounded-2xl border px-4 py-4 text-left transition ${
                          isSelected
                            ? "border-emerald-800 bg-emerald-900 text-emerald-50"
                            : "border-emerald-900/10 bg-white hover:bg-emerald-50"
                        }`}
                      >
                        <p className="text-sm font-semibold">
                          {slot.startTime} - {slot.endTime}
                        </p>
                        <p
                          className={`mt-1 text-xs ${
                            isSelected ? "text-emerald-100" : "text-emerald-900/70"
                          }`}
                        >
                          {slot.remainingSeats} place(s) restante(s) sur {slot.capacity}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-[32px] border border-emerald-900/10 bg-white/90 p-8 shadow-xl shadow-emerald-900/10">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
          Étape 2
        </p>
        <h2 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
          Finaliser la demande
        </h2>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm text-emerald-900/80">
            Nom et prénom
            <input
              className="mt-1 w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </label>

          <label className="block text-sm text-emerald-900/80">
            E-mail
            <input
              className="mt-1 w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="block text-sm text-emerald-900/80">
            Téléphone
            <input
              className="mt-1 w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-emerald-900/80">
              Participants
              <select
                className="mt-1 w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                value={participantsCount}
                onChange={(event) => setParticipantsCount(event.target.value)}
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-emerald-900/80">
              Formule
              <select
                className="mt-1 w-full rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                value={mealOption}
                onChange={(event) =>
                  setMealOption(event.target.value as MealOption)
                }
              >
                <option value="WITHOUT_MEAL">{mealLabels.WITHOUT_MEAL}</option>
                <option value="WITH_MEAL">{mealLabels.WITH_MEAL}</option>
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50/50 p-4 text-sm text-emerald-900/80">
            <p>
              Créneau choisi :{" "}
              <span className="font-semibold text-emerald-950">
                {selectedSlot
                  ? `${formatSlotDate(selectedSlot.date)} - ${selectedSlot.startTime} / ${selectedSlot.endTime}`
                  : "aucun"}
              </span>
            </p>
            <p className="mt-1">
              Total estimé :{" "}
              <span className="font-semibold text-emerald-950">{total} €</span>
            </p>
          </div>

          {submitError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {submitError}
            </p>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <p>{successMessage}</p>
              {calendarEventUrl ? (
                <a
                  className="mt-2 inline-flex font-semibold underline underline-offset-4"
                  href={calendarEventUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Voir l&apos;événement
                </a>
              ) : null}
            </div>
          ) : null}

          <button
            className="inline-flex w-full items-center justify-center rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || !selectedSlot || Boolean(slotsError)}
            type="submit"
          >
            {isSubmitting ? "Envoi en cours..." : "Continuer vers la réservation"}
          </button>
        </form>
      </section>
    </div>
  );
}

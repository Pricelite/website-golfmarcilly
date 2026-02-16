"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { generateTimeSlots } from "@/lib/restaurant/slots";

type RestaurantReservationModalProps = {
  triggerLabel?: string;
  triggerClassName?: string;
};

type ReservationForm = {
  name: string;
  email: string;
  phone: string;
  partySize: string;
  message: string;
};

type DayOption = {
  iso: string;
  weekday: string;
  dateLabel: string;
  longLabel: string;
};

const DEFAULT_TRIGGER_CLASS_NAME =
  "inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2";

const SUCCESS_MESSAGE =
  "Nous regardons la disponibilit\u00e9 et nous allons vous confirmer par mail dans les plus brefs d\u00e9lais.";

const INITIAL_FORM: ReservationForm = {
  name: "",
  email: "",
  phone: "",
  partySize: "2",
  message: "",
};

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function capitalize(value: string): string {
  if (!value) {
    return value;
  }
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeWeekdayLabel(rawWeekday: string): string {
  return capitalize(rawWeekday.replace(".", "").trim());
}

function getNextDays(count = 7): DayOption[] {
  const weekdayFormatter = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
  const longFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const now = new Date();
  const days: DayOption[] = [];

  for (let index = 0; index < count; index += 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(now.getDate() + index);
    days.push({
      iso: toLocalIsoDate(date),
      weekday: normalizeWeekdayLabel(weekdayFormatter.format(date)),
      dateLabel: dateFormatter.format(date),
      longLabel: capitalize(longFormatter.format(date)),
    });
  }

  return days;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1
  );
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function RestaurantReservationModal({
  triggerLabel = "R\u00e9server une table",
  triggerClassName = DEFAULT_TRIGGER_CLASS_NAME,
}: RestaurantReservationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState<ReservationForm>(INITIAL_FORM);
  const [formError, setFormError] = useState<string>("");
  const [apiError, setApiError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedFingerprint, setLastSubmittedFingerprint] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const descriptionId = useId();

  const dayOptions = useMemo(() => getNextDays(7), []);
  const slots = useMemo(() => generateTimeSlots("12:00", "14:30", 30), []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!selectedDay && dayOptions.length > 0) {
      setSelectedDay(dayOptions[0].iso);
    }
  }, [dayOptions, selectedDay]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setFormError("");
    setApiError("");
    triggerRef.current?.focus();
  }, []);

  const openModal = useCallback(() => {
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const modalElement = modalRef.current;
    if (!modalElement) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const focusables = getFocusableElements(modalElement!);
      if (focusables.length > 0) {
        focusables[0].focus();
      }
    }, 0);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusables = getFocusableElements(modalElement!);
      if (focusables.length === 0) {
        return;
      }

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocusedElementRef.current?.focus();
    };
  }, [closeModal, isOpen]);

  function updateField<K extends keyof ReservationForm>(
    field: K,
    value: ReservationForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
    setApiError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setApiError("");
    setSuccessMessage("");

    if (!selectedDay || !selectedTime) {
      setFormError("Selectionnez un jour et un horaire.");
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();
    const partySize = Number.parseInt(form.partySize, 10);

    if (!name) {
      setFormError("Le nom est obligatoire.");
      return;
    }

    if (!email || !isValidEmail(email)) {
      setFormError("Merci de saisir une adresse e-mail valide.");
      return;
    }

    if (!Number.isInteger(partySize) || partySize < 1) {
      setFormError("Le nombre de personnes doit etre superieur ou egal a 1.");
      return;
    }

    const payload = {
      day: selectedDay,
      time: selectedTime,
      name,
      email,
      phone,
      partySize,
      message,
    };

    const fingerprint = JSON.stringify(payload);
    if (fingerprint === lastSubmittedFingerprint) {
      setSuccessMessage(SUCCESS_MESSAGE);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/restaurant-reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": fingerprint,
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.ok) {
        setApiError(result?.error || "Impossible d'envoyer votre demande pour le moment.");
        return;
      }

      setLastSubmittedFingerprint(fingerprint);
      setSuccessMessage(SUCCESS_MESSAGE);
      setForm(INITIAL_FORM);
      setSelectedTime(null);
    } catch {
      setApiError("Une erreur reseau est survenue. Merci de reessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>

      {isOpen && isClient
        ? createPortal(
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Fermer la fenetre de reservation"
            className="absolute inset-0 bg-emerald-950/55"
            onClick={closeModal}
          />

          <div className="relative z-10 flex min-h-dvh items-center justify-center p-3 sm:p-6">
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              className="w-full max-w-5xl overflow-y-auto rounded-3xl border border-emerald-900/15 bg-white p-5 shadow-2xl max-h-[95dvh] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id={titleId} className="font-[var(--font-display)] text-3xl text-emerald-950">
                    Reservation restaurant
                  </h2>
                  <p id={descriptionId} className="mt-2 text-sm text-emerald-900/75">
                    Choisissez un jour, un horaire puis envoyez votre demande.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/20 text-xl text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  aria-label="Fermer"
                >
                  ×
                </button>
              </div>

              <form className="mt-5" onSubmit={handleSubmit} noValidate>
                <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                  <section>
                    <p className="text-sm font-semibold text-emerald-900">Planning (7 jours)</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {dayOptions.map((day) => {
                        const isSelected = day.iso === selectedDay;
                        return (
                          <button
                            key={day.iso}
                            type="button"
                            onClick={() => {
                              setSelectedDay(day.iso);
                              setFormError("");
                              setApiError("");
                              setSuccessMessage("");
                            }}
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                              isSelected
                                ? "border-emerald-800 bg-emerald-800 text-white"
                                : "border-emerald-900/15 bg-white text-emerald-900 hover:bg-emerald-50"
                            }`}
                          >
                            <span className="block font-semibold">{day.weekday}</span>
                            <span
                              className={`block text-xs ${
                                isSelected ? "text-emerald-100" : "text-emerald-800/75"
                              }`}
                            >
                              {day.dateLabel}
                            </span>
                            <span className="sr-only">{day.longLabel}</span>
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-5 text-sm font-semibold text-emerald-900">Creneaux</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                      {slots.map((slot) => {
                        const isSelected = slot === selectedTime;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setSelectedTime(slot);
                              setFormError("");
                              setApiError("");
                              setSuccessMessage("");
                            }}
                            className={`rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                              isSelected
                                ? "border-emerald-800 bg-emerald-800 text-white"
                                : "border-emerald-900/15 bg-white text-emerald-900 hover:bg-emerald-50"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="reservation-name" className="text-sm font-semibold text-emerald-900">
                          Nom *
                        </label>
                        <input
                          id="reservation-name"
                          type="text"
                          required
                          maxLength={120}
                          value={form.name}
                          onChange={(event) => updateField("name", event.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-emerald-900/20 px-4 py-2.5 text-sm text-emerald-950 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-300"
                        />
                      </div>

                      <div>
                        <label htmlFor="reservation-email" className="text-sm font-semibold text-emerald-900">
                          Email *
                        </label>
                        <input
                          id="reservation-email"
                          type="email"
                          required
                          maxLength={160}
                          value={form.email}
                          onChange={(event) => updateField("email", event.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-emerald-900/20 px-4 py-2.5 text-sm text-emerald-950 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-300"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor="reservation-phone" className="text-sm font-semibold text-emerald-900">
                          Telephone
                        </label>
                        <input
                          id="reservation-phone"
                          type="tel"
                          maxLength={30}
                          value={form.phone}
                          onChange={(event) => updateField("phone", event.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-emerald-900/20 px-4 py-2.5 text-sm text-emerald-950 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-300"
                        />
                      </div>

                      <div>
                        <label htmlFor="reservation-party-size" className="text-sm font-semibold text-emerald-900">
                          Nombre de personnes *
                        </label>
                        <input
                          id="reservation-party-size"
                          type="number"
                          required
                          min={1}
                          max={30}
                          value={form.partySize}
                          onChange={(event) => updateField("partySize", event.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-emerald-900/20 px-4 py-2.5 text-sm text-emerald-950 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="reservation-message" className="text-sm font-semibold text-emerald-900">
                        Message
                      </label>
                      <textarea
                        id="reservation-message"
                        rows={3}
                        maxLength={1200}
                        value={form.message}
                        onChange={(event) => updateField("message", event.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-emerald-900/20 px-4 py-2.5 text-sm text-emerald-950 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-300"
                      />
                    </div>
                  </section>
                </div>

                {formError ? (
                  <p className="mt-4 rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-800">{formError}</p>
                ) : null}

                {apiError ? (
                  <p className="mt-4 rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-800">{apiError}</p>
                ) : null}

                {successMessage ? (
                  <p className="mt-4 rounded-xl bg-emerald-100 px-4 py-3 text-sm text-emerald-900">
                    {successMessage}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    {isSubmitting ? "Envoi..." : "Envoyer la demande"}
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  >
                    Fermer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )
        : null}
    </>
  );
}


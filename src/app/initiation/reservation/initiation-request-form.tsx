"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

export type SlotOption = {
  value: string;
  label: string;
};

type InitiationRequestFormProps = {
  next7DaysSlots: readonly SlotOption[];
  fullYearSlots: readonly SlotOption[];
};

type ApiResponse = {
  ok?: boolean;
  message?: string;
  error?: string;
};

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
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.tabIndex !== -1
  );
}

export default function InitiationRequestForm({
  next7DaysSlots,
  fullYearSlots,
}: InitiationRequestFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const successDialogRef = useRef<HTMLDivElement | null>(null);
  const successCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const closeSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  useEffect(() => {
    if (!isSuccessModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const dialogElement = successDialogRef.current;
      if (!dialogElement) {
        return;
      }

      const firstFocusable =
        successCloseButtonRef.current ?? getFocusableElements(dialogElement)[0];
      firstFocusable?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSuccessModal();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialogElement = successDialogRef.current;
      if (!dialogElement) {
        return;
      }

      const focusables = getFocusableElements(dialogElement);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;
      const isInsideDialog = activeElement
        ? dialogElement.contains(activeElement)
        : false;

      if (event.shiftKey) {
        if (!isInsideDialog || activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (!isInsideDialog || activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      lastFocusedElementRef.current?.focus();
    };
  }, [closeSuccessModal, isSuccessModalOpen]);

  useEffect(() => {
    if (!isSuccessModalOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowValidation(true);
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isSuccessModalOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      lastName: String(formData.get("lastName") || "").trim(),
      firstName: String(formData.get("firstName") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      desiredSlot: String(formData.get("desiredSlot") || "").trim(),
      desiredSlotYear: String(formData.get("desiredSlotYear") || "").trim(),
      partySize: String(formData.get("partySize") || "").trim(),
      mealOption: String(formData.get("mealOption") || "").trim(),
      note: String(formData.get("note") || "").trim(),
    };

    if (
      !payload.lastName ||
      !payload.firstName ||
      !payload.phone ||
      !payload.email
    ) {
      setErrorMessage("Merci de renseigner nom, prenom, telephone et mail.");
      return;
    }

    if (!payload.desiredSlot && !payload.desiredSlotYear) {
      setErrorMessage("Merci de selectionner un creneau souhaite.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/initiation-reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as ApiResponse | null;
      if (!response.ok || !result?.ok) {
        setErrorMessage(
          result?.error || "Impossible d'envoyer la demande pour le moment."
        );
        return;
      }

      formRef.current?.reset();
      setShowValidation(false);
      lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
      setIsSuccessModalOpen(true);
    } catch {
      setErrorMessage("Une erreur reseau est survenue. Merci de reessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <article className="mt-6 rounded-2xl border border-emerald-900/10 bg-emerald-50/40 p-4">
        <h3 className="text-base font-semibold text-emerald-950">
          Document de demande
        </h3>
        <p className="mt-1 text-xs text-emerald-900/75">
          Remplissez ce document puis envoyez-le directement a
          {" "}
          golf@marcilly.com.
        </p>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mt-4 grid gap-4 md:grid-cols-2"
          noValidate
        >
          <label className="block text-sm text-emerald-900/85" htmlFor="initiation-last-name">
            Nom
            <input
              id="initiation-last-name"
              name="lastName"
              type="text"
              className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              placeholder="Dupont"
            />
          </label>

          <label className="block text-sm text-emerald-900/85" htmlFor="initiation-first-name">
            Prenom
            <input
              id="initiation-first-name"
              name="firstName"
              type="text"
              className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              placeholder="Marie"
            />
          </label>

          <label className="block text-sm text-emerald-900/85" htmlFor="initiation-phone">
            Telephone
            <input
              id="initiation-phone"
              name="phone"
              type="tel"
              className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              placeholder="06 12 34 56 78"
            />
          </label>

          <label className="block text-sm text-emerald-900/85" htmlFor="initiation-email">
            Mail
            <input
              id="initiation-email"
              name="email"
              type="email"
              className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              placeholder="nom@exemple.fr"
            />
          </label>

          <label className="block text-sm text-emerald-900/85" htmlFor="initiation-day">
            Creneau souhaite (prochains 7 jours)
            <select
              id="initiation-day"
              name="desiredSlot"
              className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              defaultValue=""
            >
              <option value="">Selectionner un creneau</option>
              {next7DaysSlots.map((slot) => (
                <option key={`next-${slot.value}`} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
            {next7DaysSlots.length === 0 ? (
              <span className="mt-1 block text-xs text-amber-800">
                Aucun creneau disponible sur les 7 prochains jours.
              </span>
            ) : null}
            <details className="mt-3 block">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-emerald-900/20 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-50">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
                  <path d="M8 3.5v3M16 3.5v3M3.5 9.5h17" />
                </svg>
                Afficher toute l annee 2026
              </summary>
              <div className="mt-3">
                <label className="block" htmlFor="initiation-day-year">
                  Tous les creneaux 2026
                  <select
                    id="initiation-day-year"
                    name="desiredSlotYear"
                    className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                    defaultValue=""
                  >
                    <option value="">Selectionner un creneau annuel</option>
                    {fullYearSlots.map((slot) => (
                      <option key={`year-${slot.value}`} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </details>
          </label>

          <label className="block text-sm text-emerald-900/85" htmlFor="initiation-party-size">
            Nombre de personnes
            <input
              id="initiation-party-size"
              name="partySize"
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              placeholder="1"
            />
          </label>

          <label className="block text-sm text-emerald-900/85" htmlFor="initiation-meal">
            Option repas
            <select
              id="initiation-meal"
              name="mealOption"
              className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              defaultValue=""
            >
              <option value="">Selectionner</option>
              <option value="WITH_MEAL">Avec repas</option>
              <option value="WITHOUT_MEAL">Sans repas</option>
            </select>
          </label>

          <label className="block text-sm text-emerald-900/85 md:col-span-2" htmlFor="initiation-note">
            Commentaire
            <textarea
              id="initiation-note"
              name="note"
              rows={4}
              className="mt-1 w-full rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              placeholder="Informations complementaires"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-800 md:col-span-2">
              {errorMessage}
            </p>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
            >
              {isSubmitting ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
      </article>

      {isSuccessModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <button
            type="button"
            aria-label="Fermer la fenetre de confirmation"
            onClick={closeSuccessModal}
            className="absolute inset-0 bg-emerald-950/50"
          />
          <div
            ref={successDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="initiation-success-title"
            aria-describedby="initiation-success-description"
            className="relative z-10 w-full max-w-md rounded-3xl border border-emerald-900/10 bg-white p-8 text-center shadow-2xl shadow-emerald-900/20"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              {showValidation ? (
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              ) : (
                <span
                  className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700"
                  aria-hidden="true"
                />
              )}
            </div>

            <h3
              id="initiation-success-title"
              className="font-[var(--font-display)] text-2xl text-emerald-950"
            >
              Message envoye
            </h3>
            <p
              id="initiation-success-description"
              className="mt-3 text-sm leading-6 text-emerald-900/75"
            >
              Votre message a bien ete recu et nous revenons vers vous au plus vite.
            </p>

            <button
              ref={successCloseButtonRef}
              type="button"
              onClick={closeSuccessModal}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-2.5 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800"
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

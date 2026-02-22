"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { ContactActionState } from "@/app/contact/actions";
import { sendContactEmail } from "@/app/contact/actions";

const initialState: ContactActionState = {
  ok: false,
  message: "",
};

const SCHOOL_INFO_TEMPLATE = "ecole-golf-info";
const SCHOOL_INFO_MESSAGE =
  "Je souhaite des informations sur l'école de golf de Marcilly.";

function getInputClass(hasError: boolean): string {
  return `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition ${
    hasError
      ? "border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-300"
      : "border-emerald-900/20 focus-visible:ring-2 focus-visible:ring-emerald-300"
  }`;
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
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.tabIndex !== -1
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-sm text-rose-700">
      {message}
    </p>
  );
}

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactEmail, initialState);
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement | null>(null);
  const successDialogRef = useRef<HTMLDivElement | null>(null);
  const successCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const errors = state.fieldErrors ?? {};
  const template = searchParams.get("template");
  const isSchoolInfoTemplate = template === SCHOOL_INFO_TEMPLATE;

  const closeSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
  }, []);

  useEffect(() => {
    if (!state.ok || !state.message) {
      return;
    }

    formRef.current?.reset();
    const openTimer = window.setTimeout(() => {
      lastFocusedElementRef.current = document.activeElement as HTMLElement | null;
      setIsSuccessModalOpen(true);
      setShowValidation(false);
    }, 0);

    const validationTimer = window.setTimeout(() => {
      setShowValidation(true);
    }, 900);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(validationTimer);
    };
  }, [state]);

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

  return (
    <>
      <form ref={formRef} action={formAction} noValidate className="mt-6 space-y-5">
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Site web</label>
          <input
            id="website"
            name="website"
            type="text"
            autoComplete="off"
            tabIndex={-1}
            className="hidden"
          />
        </div>

        <input
          type="hidden"
          name="template"
          value={isSchoolInfoTemplate ? SCHOOL_INFO_TEMPLATE : ""}
          readOnly
        />

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-emerald-900" htmlFor="nom">
              Nom *
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              maxLength={120}
              aria-invalid={Boolean(errors.nom)}
              aria-describedby={errors.nom ? "nom-error" : undefined}
              className={getInputClass(Boolean(errors.nom))}
            />
            <FieldError id="nom-error" message={errors.nom} />
          </div>

          <div>
            <label className="text-sm font-semibold text-emerald-900" htmlFor="prenom">
              Prénom *
            </label>
            <input
              id="prenom"
              name="prenom"
              type="text"
              required
              maxLength={120}
              aria-invalid={Boolean(errors.prenom)}
              aria-describedby={errors.prenom ? "prenom-error" : undefined}
              className={getInputClass(Boolean(errors.prenom))}
            />
            <FieldError id="prenom-error" message={errors.prenom} />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              className="text-sm font-semibold text-emerald-900"
              htmlFor="entreprise"
            >
              Entreprise
            </label>
            <input
              id="entreprise"
              name="entreprise"
              type="text"
              maxLength={120}
              aria-invalid={Boolean(errors.entreprise)}
              aria-describedby={errors.entreprise ? "entreprise-error" : undefined}
              className={getInputClass(Boolean(errors.entreprise))}
            />
            <FieldError id="entreprise-error" message={errors.entreprise} />
          </div>

          <div>
            <label
              className="text-sm font-semibold text-emerald-900"
              htmlFor="telephone"
            >
              Téléphone
            </label>
            <input
              id="telephone"
              name="telephone"
              type="tel"
              required={isSchoolInfoTemplate}
              maxLength={30}
              aria-invalid={Boolean(errors.telephone)}
              aria-describedby={errors.telephone ? "telephone-error" : undefined}
              className={getInputClass(Boolean(errors.telephone))}
            />
            <FieldError id="telephone-error" message={errors.telephone} />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-emerald-900" htmlFor="email">
            Adresse e-mail *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={160}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={getInputClass(Boolean(errors.email))}
          />
          <FieldError id="email-error" message={errors.email} />
        </div>

        {isSchoolInfoTemplate ? (
          <div className="rounded-xl border border-emerald-900/10 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
              Demande pré-remplie
            </p>
            <p className="mt-1 text-sm text-emerald-900">{SCHOOL_INFO_MESSAGE}</p>
            <input type="hidden" name="message" value={SCHOOL_INFO_MESSAGE} readOnly />
          </div>
        ) : (
          <div>
            <label className="text-sm font-semibold text-emerald-900" htmlFor="message">
              La demande / le message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              maxLength={2000}
              rows={7}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "message-error" : undefined}
              className={getInputClass(Boolean(errors.message))}
            />
            <FieldError id="message-error" message={errors.message} />
          </div>
        )}

        <p className="text-xs leading-5 text-emerald-900/70">
          Les données de ce formulaire sont utilisées uniquement pour traiter votre
          demande de contact.
        </p>

        <div aria-live="polite">
          {state.message && !state.ok ? (
            <p className="rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-800">
              {state.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Envoi..." : "Envoyer"}
        </button>
      </form>

      {isSuccessModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <button
            type="button"
            aria-label="Fermer la fenêtre de confirmation"
            onClick={closeSuccessModal}
            className="absolute inset-0 bg-emerald-950/50"
          />
          <div
            ref={successDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-success-title"
            aria-describedby="contact-success-description"
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
              id="contact-success-title"
              className="font-[var(--font-display)] text-2xl text-emerald-950"
            >
              Message envoyé
            </h3>
            <p
              id="contact-success-description"
              className="mt-3 text-sm leading-6 text-emerald-900/75"
            >
              Votre e-mail est bien envoyé et sera traité dans les meilleurs délais.
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

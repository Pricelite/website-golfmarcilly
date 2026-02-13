"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import type { ContactActionState } from "@/app/contact/actions";
import { sendContactEmail } from "@/app/contact/actions";

const initialState: ContactActionState = {
  ok: false,
  message: "",
};

function getInputClass(hasError: boolean): string {
  return `mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-emerald-950 outline-none transition ${
    hasError
      ? "border-rose-500 focus-visible:ring-2 focus-visible:ring-rose-300"
      : "border-emerald-900/20 focus-visible:ring-2 focus-visible:ring-emerald-300"
  }`;
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
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (!state.ok || !state.message) {
      return;
    }

    formRef.current?.reset();
    const openTimer = window.setTimeout(() => {
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

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSuccessModalOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSuccessModalOpen]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/50 px-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-success-title"
            className="w-full max-w-md rounded-3xl border border-emerald-900/10 bg-white p-8 text-center shadow-2xl shadow-emerald-900/20"
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
            <p className="mt-3 text-sm leading-6 text-emerald-900/75">
              Votre e-mail est bien envoyé et sera traité dans les meilleurs délais.
            </p>

            <button
              type="button"
              onClick={() => setIsSuccessModalOpen(false)}
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

"use client";

import { useActionState } from "react";

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
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="mt-6 space-y-5">
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
            Prenom *
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
            Telephone
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
          Adresse mail *
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
          La demande / message *
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
        Les donnees de ce formulaire sont utilisees uniquement pour traiter votre
        demande de contact.
      </p>

      <div aria-live="polite">
        {state.message ? (
          <p
            className={`rounded-xl px-4 py-3 text-sm ${
              state.ok
                ? "bg-emerald-100 text-emerald-900"
                : "bg-rose-100 text-rose-800"
            }`}
          >
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
  );
}

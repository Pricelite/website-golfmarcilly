"use client";

import { useRef, useState } from "react";
import { FORM_NETWORK_ERROR, getFormErrorMessage } from "@/lib/api/form-feedback";

type FormState = "idle" | "loading" | "success" | "error";

type ContactFormProps = {
  context?: string;
  submitLabel?: string;
  successMessage?: string;
  subjectPlaceholder?: string;
  messagePlaceholder?: string;
};

export function ContactForm({
  context = "contact",
  submitLabel = "Envoyer ma demande",
  successMessage = "Votre demande a bien été reçue par le site.",
  subjectPlaceholder = "Réservation, renseignement, événement...",
  messagePlaceholder = "Décrivez votre demande.",
}: ContactFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState(successMessage);
  const submittingRef = useRef(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setState("loading");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData)),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.ok !== true) {
        setErrorMessage(getFormErrorMessage(response.status));
        setState("error");
        return;
      }

      form.reset();
      setConfirmationMessage(payload?.queued === true ? payload.message : successMessage);
      setState("success");
    } catch {
      setErrorMessage(FORM_NETWORK_ERROR);
      setState("error");
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form
      className="space-y-5 rounded-[36px] border border-emerald-950/10 bg-white/92 p-6 shadow-xl shadow-emerald-950/8 backdrop-blur sm:p-8"
      onSubmit={handleSubmit}
      aria-busy={state === "loading"}
    >
      <input name="context" type="hidden" value={context} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-emerald-950">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">
            Prénom
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
            name="firstName"
            placeholder="Votre prénom"
            required
            type="text"
          />
        </label>
        <label className="text-sm font-medium text-emerald-950">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">Nom</span>
          <input
            className="mt-2 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
            name="lastName"
            placeholder="Votre nom"
            required
            type="text"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-emerald-950">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">
            Téléphone
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
            name="phone"
            placeholder="06 00 00 00 00"
            type="tel"
          />
        </label>
        <label className="text-sm font-medium text-emerald-950">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">Email</span>
          <input
            className="mt-2 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
            name="email"
            placeholder="vous@exemple.fr"
            required
            type="email"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-emerald-950">
        <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">Objet</span>
        <input
          className="mt-2 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
          name="subject"
          placeholder={subjectPlaceholder}
          type="text"
        />
      </label>

      <label className="block text-sm font-medium text-emerald-950">
        <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">Message</span>
        <textarea
          className="mt-2 min-h-40 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
          name="message"
          placeholder={messagePlaceholder}
          required
        />
      </label>

      <div className="flex justify-end">
        <button
          className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-stone-50 shadow-lg shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
          disabled={state === "loading"}
          type="submit"
        >
          {state === "loading" ? "Envoi..." : submitLabel}
        </button>
      </div>

      {state === "success" ? (
        <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {confirmationMessage}
        </p>
      ) : null}

      {state === "error" ? (
        <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage || "Une erreur est survenue. Merci de réessayer."}
        </p>
      ) : null}
    </form>
  );
}

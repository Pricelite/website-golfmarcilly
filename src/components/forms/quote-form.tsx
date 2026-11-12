"use client";

import { formPanelClass, formFieldClass, formLabelClass, formSubmitClass, formErrorClass, formSuccessClass } from "@/components/forms/form-styles";

import { useRef, useState, type FormEvent } from "react";
import posthog from "posthog-js";
import { FormPrivacyNotice } from "@/components/forms/form-privacy-notice";
import { parisDateKey } from "@/lib/site-conditions";
import { FORM_NETWORK_ERROR } from "@/lib/api/form-feedback";

type FormState = "idle" | "loading" | "success" | "error";
type ApiErrorPayload = {
  error?: string;
};

export function QuoteForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("Votre demande de devis a bien été reçue par le site.");
  const submitting = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || state === "success") return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    submitting.current = true;
    setState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | ApiErrorPayload
          | null;
        setErrorMessage(
          payload?.error || "Une erreur est survenue. Merci de réessayer."
        );
        setState("error");
        return;
      }

      const result = await response.json().catch(() => null);
      posthog.capture("quote_requested");
      if (typeof result?.message === "string") setConfirmationMessage(result.message);
      form.reset();
      setState("success");
    } catch {
      setErrorMessage(FORM_NETWORK_ERROR);
      setState("error");
    } finally {
      submitting.current = false;
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${formPanelClass} space-y-5`}
    >
      <div className="rounded-[24px] border border-emerald-950/8 bg-stone-50 px-4 py-4 text-sm leading-7 text-emerald-950/72">
        Décrivez votre projet en quelques mots. Notre équipe prendra contact avec vous pour préciser les possibilités.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={formLabelClass}>
          <span className="text-sm font-semibold text-emerald-950">
            Entreprise / Organisateur
          </span>
          <input
            className={formFieldClass}
            name="company"
            autoComplete="organization"
            maxLength={160}
            placeholder="Nom de l’entreprise ou du porteur de projet"
            required
            type="text"
          />
        </label>
        <label className={formLabelClass}>
          <span className="text-sm font-semibold text-emerald-950">
            Email
          </span>
          <input
            className={formFieldClass}
            name="email"
            autoComplete="email"
            maxLength={160}
            placeholder="vous@entreprise.fr"
            required
            type="email"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={formLabelClass}>
            <span className="text-sm font-semibold text-emerald-950">
            Type d&apos;événement
          </span>
          <input
            className={formFieldClass}
            name="eventType"
            maxLength={120}
            placeholder="Séminaire, mariage, team building…"
            required
            type="text"
          />
        </label>
        <label className={formLabelClass}>
          <span className="text-sm font-semibold text-emerald-950">
            Nombre de participants
          </span>
          <input
            className={formFieldClass}
            name="participants"
            min={1}
            required
            type="number"
          />
        </label>
      </div>

      <label className={formLabelClass}>Date souhaitée (facultatif)
        <input type="date" name="desiredDate" min={parisDateKey(new Date())} className={formFieldClass} />
        <span className="mt-1 block text-xs text-emerald-950/75">Laissez vide si votre date reste à définir.</span>
      </label>
      <label className={formLabelClass}>
        <span className="text-sm font-semibold text-emerald-950">
          Besoin détaillé
        </span>
        <textarea
          className={`${formFieldClass} min-h-40`}
          name="details"
          maxLength={4000}
          placeholder="Date souhaitée, ambiance, restauration, objectifs…"
          required
        />
      </label>

      <FormPrivacyNotice purpose="étudier votre projet et vous répondre au sujet du devis demandé" />

      <div className="flex flex-col items-start gap-4">
        <p className="max-w-md text-xs leading-6 text-emerald-950/55">
          Date, restauration, activité golf : partagez ce qui compte pour vous dans votre message.
        </p>
        <button
          disabled={state === "loading" || state === "success"}
          className={formSubmitClass}
          type="submit"
        >
          {state === "loading" ? "Envoi…" : "Demander mon devis"}
        </button>
      </div>

      {state === "success" ? (
        <p role="status" className={formSuccessClass}>
            {confirmationMessage}
        </p>
      ) : null}

      {state === "error" ? (
        <p role="alert" className={formErrorClass}>
          {errorMessage || "Une erreur est survenue. Merci de réessayer."}
        </p>
      ) : null}
    </form>
  );
}

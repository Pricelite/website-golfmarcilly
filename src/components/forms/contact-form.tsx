"use client";

import { formPanelClass, formFieldClass, formLabelClass, formSubmitClass, formErrorClass, formSuccessClass } from "@/components/forms/form-styles";

import { useRef, useState } from "react";
import { capturePostHog } from "@/lib/analytics/posthog-client";
import { FormPrivacyNotice } from "@/components/forms/form-privacy-notice";
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
  subjectPlaceholder = "Réservation, renseignement, événement…",
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

      capturePostHog("contact_request_submitted", { contact_context: context });
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
      className={`${formPanelClass} space-y-5`}
      onSubmit={handleSubmit}
      aria-busy={state === "loading"}
    >
      <input name="context" type="hidden" value={context} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={formLabelClass}>
          <span className="text-sm font-semibold text-emerald-950">
            Prénom
          </span>
          <input
            className={formFieldClass}
            name="firstName"
            autoComplete="given-name"
            maxLength={80}
            placeholder="Votre prénom"
            required
            type="text"
          />
        </label>
        <label className={formLabelClass}>
          <span className="text-sm font-semibold text-emerald-950">Nom</span>
          <input
            className={formFieldClass}
            name="lastName"
            autoComplete="family-name"
            maxLength={80}
            placeholder="Votre nom"
            required
            type="text"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={formLabelClass}>
          <span className="text-sm font-semibold text-emerald-950">
            Téléphone
          </span>
          <input
            className={formFieldClass}
            name="phone"
            autoComplete="tel"
            maxLength={30}
            placeholder="06 00 00 00 00"
            type="tel"
          />
        </label>
        <label className={formLabelClass}>
          <span className="text-sm font-semibold text-emerald-950">Email</span>
          <input
            className={formFieldClass}
            name="email"
            autoComplete="email"
            maxLength={160}
            placeholder="vous@exemple.fr"
            required
            type="email"
          />
        </label>
      </div>

      <label className={formLabelClass}>
        <span className="text-sm font-semibold text-emerald-950">Objet</span>
        <input
          className={formFieldClass}
          name="subject"
          maxLength={160}
          placeholder={subjectPlaceholder}
          type="text"
        />
      </label>

      <label className={formLabelClass}>
        <span className="text-sm font-semibold text-emerald-950">Message</span>
        <textarea
          className={`${formFieldClass} min-h-40`}
          name="message"
          maxLength={4000}
          placeholder={messagePlaceholder}
          required
        />
      </label>

      <FormPrivacyNotice purpose="traiter et répondre à votre demande" />

      <div className="flex justify-start">
        <button
          className={formSubmitClass}
          disabled={state === "loading"}
          type="submit"
        >
          {state === "loading" ? "Envoi…" : submitLabel}
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

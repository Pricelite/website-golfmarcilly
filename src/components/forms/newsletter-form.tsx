"use client";

import { formPanelClass, formFieldClass, formLabelClass, formSubmitClass, formErrorClass, formSuccessClass } from "@/components/forms/form-styles";

import { useRef, useState } from "react";
import { capturePostHog } from "@/lib/analytics/posthog-client";
import { FORM_NETWORK_ERROR } from "@/lib/api/form-feedback";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);

  async function handleSubmit(formData: FormData) {
    if (submitting.current || status === "success") return;
    submitting.current = true;
    setPending(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const result = await response.json().catch(() => null);
        capturePostHog("newsletter_subscribed");
        setConfirmationMessage(typeof result?.message === "string" ? result.message : "Votre demande d’inscription a été transmise au golf.");
        setStatus("success");
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setErrorMessage(
        payload?.error ||
          "Impossible d’enregistrer votre e-mail pour le moment."
      );
      setStatus("error");
    } catch {
      setErrorMessage(FORM_NETWORK_ERROR);
      setStatus("error");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className={`${formPanelClass} space-y-5`} aria-busy={pending}>
      <label className={formLabelClass}>
        Email
        <input
          className={formFieldClass}
          name="email"
          placeholder="vous@entreprise.fr"
          required
          type="email"
        />
      </label>
      <button
        className={formSubmitClass}
        type="submit"
        disabled={pending || status === "success"}
      >
        {pending ? "Envoi…" : "S’inscrire"}
      </button>
      {status === "success" ? (
        <p role="status" className={formSuccessClass}>{confirmationMessage}</p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className={formErrorClass}>
          {errorMessage || "Impossible d’enregistrer votre e-mail pour le moment."}
        </p>
      ) : null}
    </form>
  );
}

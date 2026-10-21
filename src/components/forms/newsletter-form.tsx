"use client";

import { useRef, useState } from "react";
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
        setConfirmationMessage(typeof result?.message === "string" ? result.message : "Votre demande d’inscription a été transmise au golf.");
        setStatus("success");
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setErrorMessage(
        payload?.error ||
          "Impossible d'enregistrer votre email pour le moment."
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
    <form action={handleSubmit} className="space-y-3" aria-busy={pending}>
      <label className="block text-sm text-stone-100/88">
        Email
        <input
          className="mt-2 w-full rounded-full border border-stone-100/18 bg-stone-50/10 px-4 py-3 text-stone-50 placeholder:text-stone-100/45"
          name="email"
          placeholder="vous@entreprise.fr"
          required
          type="email"
        />
      </label>
      <button
        className="site-button rounded-full px-4 py-3 text-sm font-semibold"
        type="submit"
        disabled={pending || status === "success"}
      >
        {pending ? "Envoi…" : "S’inscrire"}
      </button>
      {status === "success" ? (
        <p role="status" className="text-sm text-emerald-200">{confirmationMessage}</p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-sm text-red-200">
          {errorMessage || "Impossible d'enregistrer votre email pour le moment."}
        </p>
      ) : null}
    </form>
  );
}

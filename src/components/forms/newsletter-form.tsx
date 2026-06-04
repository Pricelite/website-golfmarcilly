"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setErrorMessage("");

    const response = await fetch("/api/newsletter", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
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
  }

  return (
    <form action={handleSubmit} className="space-y-3">
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
        className="rounded-full bg-stone-50 px-4 py-3 text-sm font-semibold text-emerald-950"
        type="submit"
      >
        S&apos;inscrire
      </button>
      {status === "success" ? (
        <p className="text-sm text-emerald-200">Merci, votre inscription est prise en compte.</p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-200">
          {errorMessage || "Impossible d'enregistrer votre email pour le moment."}
        </p>
      ) : null}
    </form>
  );
}

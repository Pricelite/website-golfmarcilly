"use client";

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";
type ApiErrorPayload = {
  error?: string;
};

export function QuoteForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(formData: FormData) {
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

      setState("success");
    } catch {
      setErrorMessage("Une erreur est survenue. Merci de réessayer.");
      setState("error");
    }
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-5 rounded-[36px] border border-emerald-950/10 bg-white/92 p-6 shadow-xl shadow-emerald-950/8 backdrop-blur sm:p-8"
    >
      <div className="rounded-[24px] border border-emerald-950/8 bg-stone-50 px-4 py-4 text-sm leading-7 text-emerald-950/72">
        Formulaire de devis connecté au système d&apos;email du site. S&apos;il manque
        encore la configuration SMTP ou Brevo, le message de blocage sera affiché.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-emerald-950">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">
            Entreprise / Organisateur
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
            name="company"
            placeholder="Nom de l'entreprise ou du porteur de projet"
            required
            type="text"
          />
        </label>
        <label className="text-sm font-medium text-emerald-950">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">
            Email
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
            name="email"
            placeholder="vous@entreprise.fr"
            required
            type="email"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-emerald-950">
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">
            Type d&apos;événement
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
            name="eventType"
            placeholder="Séminaire, mariage, team building..."
            required
            type="text"
          />
        </label>
        <label className="text-sm font-medium text-emerald-950">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">
            Nombre de participants
          </span>
          <input
            className="mt-2 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
            name="participants"
            required
            type="number"
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-emerald-950">
        <span className="text-xs uppercase tracking-[0.2em] text-emerald-700">
          Besoin détaillé
        </span>
        <textarea
          className="mt-2 min-h-40 w-full rounded-2xl border border-emerald-950/12 bg-stone-50/70 px-4 py-3 outline-none transition placeholder:text-emerald-950/35 focus:border-emerald-800 focus:bg-white"
          name="details"
          placeholder="Date souhaitée, ambiance, restauration, objectifs..."
          required
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-md text-xs leading-6 text-emerald-950/55">
          Cette demande part vers l&apos;API du site puis vers votre boîte email
          dès que le fournisseur mail est configuré.
        </p>
        <button
          className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-stone-50 shadow-lg shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-emerald-800"
          type="submit"
        >
          {state === "loading" ? "Envoi..." : "Recevoir un devis"}
        </button>
      </div>

      {state === "success" ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Votre demande de devis a bien été reçue par le site.
        </p>
      ) : null}

      {state === "error" ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage || "Une erreur est survenue. Merci de réessayer."}
        </p>
      ) : null}
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";

export function NewPageForm() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const fields = new FormData(event.currentTarget);
    const title = String(fields.get("title") ?? "");
    const slug = String(fields.get("slug") ?? "");
    try {
      const response = await fetch("/api/backoffice/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, content: { title, seoTitle: title, seoDescription: "", theme: "cream", blocks: [] } }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Création impossible.");
      location.assign(`/admin/contenu/pages/${data.page.id}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Création impossible."); setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-4 grid gap-3 rounded-2xl border border-emerald-950/10 bg-white p-5 sm:grid-cols-2">
    <label className="text-sm">Titre<input name="title" required maxLength={120} className="mt-1 w-full rounded-lg border p-2" /></label>
    <label className="text-sm">Adresse après /pages/<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} className="mt-1 w-full rounded-lg border p-2" /></label>
    {error ? <p role="alert" className="text-sm text-red-700 sm:col-span-2">{error}</p> : null}
    <button disabled={busy} className="site-button sm:col-span-2">{busy ? "Création…" : "Créer un brouillon"}</button>
  </form>;
}

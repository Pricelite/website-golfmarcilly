"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export function ActivateForm({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const fields = new FormData(event.currentTarget);
    if (fields.get("password") !== fields.get("confirm")) { setError("Les mots de passe sont différents."); setBusy(false); return; }
    try { const response = await fetch("/api/backoffice/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: fields.get("password") }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Activation impossible."); setDone(true); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Activation impossible."); }
    finally { setBusy(false); }
  }
  if (done) return <p role="status" className="mt-8 rounded-xl bg-emerald-50 p-5 text-sm">Compte activé. <Link className="underline" href="/admin/contenu/connexion">Se connecter</Link>.</p>;
  return <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border bg-white p-5"><label className="block text-sm">Mot de passe<input name="password" type="password" minLength={14} maxLength={256} autoComplete="new-password" required className="mt-1 w-full rounded-xl border p-3" /></label><label className="block text-sm">Confirmer le mot de passe<input name="confirm" type="password" minLength={14} maxLength={256} autoComplete="new-password" required className="mt-1 w-full rounded-xl border p-3" /></label>{error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}<button disabled={busy || !token} className="site-button w-full disabled:opacity-50">{busy ? "Activation…" : "Activer mon compte"}</button></form>;
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ChangeStaffPasswordForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmation) { setError("Les nouveaux mots de passe ne correspondent pas."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/restaurant-admin/password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmation }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Modification impossible.");
      router.replace("/admin/restaurant/connexion?password=changed");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Modification impossible.");
      setBusy(false);
    }
  }

  const input = "mt-1 w-full rounded-lg border border-emerald-950/20 px-3 py-2";
  return <form onSubmit={submit} className="mt-7 space-y-4">
    <h2 className="font-serif text-xl">Changer mon mot de passe</h2>
    <p className="text-sm text-emerald-950/75">Choisissez au moins 13 caractères. Après l’enregistrement, reconnectez-vous avec le nouveau mot de passe.</p>
    {error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    <label className="block text-sm">Mot de passe actuel<input className={input} type="password" autoComplete="current-password" required maxLength={256} value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} /></label>
    <label className="block text-sm">Nouveau mot de passe<input className={input} type="password" autoComplete="new-password" required minLength={13} maxLength={256} value={newPassword} onChange={event => setNewPassword(event.target.value)} /></label>
    <label className="block text-sm">Confirmer le nouveau mot de passe<input className={input} type="password" autoComplete="new-password" required minLength={13} maxLength={256} value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label>
    <button type="submit" disabled={busy} className="site-button disabled:opacity-50">{busy ? "Enregistrement…" : "Enregistrer le mot de passe"}</button>
  </form>;
}

"use client";

export function LogoutButton() {
  return <button type="button" onClick={async () => { await fetch("/api/backoffice/session", { method: "DELETE" }); location.assign("/admin/contenu/connexion"); }} className="rounded-full border border-emerald-950/20 px-4 py-2 text-sm">Déconnexion</button>;
}

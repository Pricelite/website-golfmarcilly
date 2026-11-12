"use client";

import { useState, type FormEvent } from "react";
import { RESTAURANT_ID, RESTAURANT_NAME } from "@/lib/restaurant-admin/policy";

type Staff = { id: string; email: string | null; username: string | null; name: string; role: string; restaurantId: string; active: boolean; createdAt: string };
const input = "mt-1 w-full rounded-lg border border-emerald-950/20 bg-white px-3 py-2 text-sm";

export function RestaurantAccessManager({ initialUsers }: { initialUsers: Staff[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const response = await fetch("/api/admin/restaurant-users", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Lecture des comptes impossible.");
    setUsers(data.users);
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage(""); setLink("");
    try {
      const response = await fetch("/api/admin/restaurant-users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, username, email, restaurantId: RESTAURANT_ID }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Création impossible.");
      setLink(`${location.origin}${data.activationPath}`);
      setMessage("Compte créé. Transmettez ce lien d’activation à la personne par un canal sûr.");
      setName(""); setUsername(""); setEmail(""); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Création impossible."); }
    finally { setBusy(false); }
  }

  async function change(id: string, action: "revoke" | "invite") {
    setBusy(true); setError(""); setMessage(""); setLink("");
    try {
      const response = await fetch(`/api/admin/restaurant-users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Modification impossible.");
      if (data.activationPath) setLink(`${location.origin}${data.activationPath}`);
      setMessage(action === "revoke" ? "Accès révoqué. Les sessions et invitations ont été annulées." : "Nouveau lien créé. Les anciennes sessions et invitations ont été annulées.");
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Modification impossible."); }
    finally { setBusy(false); }
  }

  return <div className="mt-7 space-y-8">
    {message ? <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm">{message}</p> : null}
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
    {link ? <div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><label className="text-sm font-semibold">Lien d’activation personnel<input readOnly value={link} onFocus={event => event.currentTarget.select()} className={input} /></label><p className="mt-2 text-xs">Copiez ce lien maintenant : il n’est affiché qu’une fois et expire dans 24 heures.</p></div> : null}
    <form onSubmit={create} className="rounded-2xl bg-white p-5">
      <h2 className="font-serif text-2xl">Inviter une personne</h2>
      <p className="mt-2 text-sm">Rôle attribué : administrateur restaurant · {RESTAURANT_NAME}.</p>
      <p className="mt-2 text-sm">Indiquez un identifiant, une adresse e-mail ou les deux. La personne choisira son mot de passe avec le lien d’activation.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Nom<input className={input} value={name} onChange={event => setName(event.target.value)} required maxLength={100} /></label>
        <label className="text-sm">Identifiant<input className={input} value={username} onChange={event => setUsername(event.target.value)} required={!email.trim()} minLength={3} maxLength={50} pattern="[A-Za-z][A-Za-z0-9._-]*" /></label>
        <label className="text-sm">Adresse e-mail<input className={input} type="email" value={email} onChange={event => setEmail(event.target.value)} required={!username.trim()} maxLength={254} /></label>
      </div>
      <button type="submit" disabled={busy} className="site-button mt-5">Créer le compte et le lien</button>
    </form>
    <section><h2 className="font-serif text-2xl">Comptes restaurant</h2>
      {users.length ? <ul className="mt-4 space-y-3">{users.map(user => <li key={user.id} className="rounded-2xl bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{user.name}</p>{user.username ? <p className="text-sm text-emerald-900/70">Identifiant : {user.username}</p> : null}{user.email ? <p className="text-sm text-emerald-900/70">{user.email}</p> : null}<p className="mt-1 text-xs">{RESTAURANT_NAME} · Administrateur restaurant</p></div><span className="text-sm">{user.active ? "Actif" : "Inactif ou en attente d’activation"}</span></div>
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => void change(user.id, "revoke")} className="rounded-full border px-4 py-2 text-sm disabled:opacity-50">Révoquer l’accès ou l’invitation</button><button type="button" disabled={busy} onClick={() => void change(user.id, "invite")} className="rounded-full border px-4 py-2 text-sm">Créer un nouveau lien</button></div>
      </li>)}</ul> : <p className="mt-3 text-sm">Aucun compte restaurant pour le moment.</p>}
    </section>
  </div>;
}

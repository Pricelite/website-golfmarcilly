"use client";

import { useState, type FormEvent } from "react";
import { adminSections, sectionLabels, RESTAURANT_ID, type AdminSection } from "@/lib/restaurant-admin/policy";

type Staff = { id: string; email: string | null; username: string | null; name: string; role: string; restaurantId: string; active: boolean; sections: AdminSection[]; createdAt: string };
const input = "mt-1 w-full rounded-lg border border-emerald-950/20 bg-white px-3 py-2 text-sm";

export function RestaurantAccessManager({ initialUsers }: { initialUsers: Staff[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [sections, setSections] = useState<AdminSection[]>(["restaurant"]);
  const [draftSections, setDraftSections] = useState<Record<string, AdminSection[]>>({});
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
      const response = await fetch("/api/admin/restaurant-users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, username, email, sections, restaurantId: RESTAURANT_ID }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Création impossible.");
      setLink(`${location.origin}${data.activationPath}`);
      setMessage("Compte créé. Transmettez ce lien d’activation à la personne par un canal sûr.");
      setName(""); setUsername(""); setEmail(""); setSections(["restaurant"]); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Création impossible."); }
    finally { setBusy(false); }
  }

  async function saveSections(id: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/restaurant-users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "sections", sections: draftSections[id] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Modification impossible.");
      setMessage("Droits enregistrés. Les anciennes sessions ont été fermées.");
      await refresh();
      setDraftSections(current => { const next = { ...current }; delete next[id]; return next; });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Modification impossible."); }
    finally { setBusy(false); }
  }

  async function remove(id: string, name: string) {
    if (!window.confirm(`Supprimer définitivement le compte de ${name} ?`)) return;
    setBusy(true); setError(""); setMessage(""); setLink("");
    try {
      const response = await fetch(`/api/admin/restaurant-users/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Suppression impossible.");
      setMessage("Compte supprimé. Ses sessions et invitations ont été annulées.");
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Suppression impossible."); }
    finally { setBusy(false); }
  }

  function toggle(current: AdminSection[], section: AdminSection, checked: boolean): AdminSection[] {
    return checked ? [...current, section] : current.filter(item => item !== section);
  }

  function sectionChoices(value: AdminSection[], onChange: (value: AdminSection[]) => void) {
    return <fieldset className="mt-4"><legend className="text-sm font-semibold">Rubriques autorisées</legend><div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{adminSections.map(section => <label key={section} className="flex items-center gap-2 rounded-lg border border-emerald-950/10 p-3 text-sm"><input type="checkbox" checked={value.includes(section)} onChange={event => onChange(toggle(value, section, event.target.checked))} />{sectionLabels[section]}</label>)}</div></fieldset>;
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
      <h2 className="font-serif text-2xl">Créer un accès personnel</h2>
      <p className="mt-2 text-sm">Choisissez un identifiant unique. L’adresse e-mail est facultative. La personne définira son mot de passe avec le lien d’activation.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Nom<input className={input} value={name} onChange={event => setName(event.target.value)} required maxLength={100} /></label>
        <label className="text-sm">Identifiant<input className={input} value={username} onChange={event => setUsername(event.target.value)} required minLength={3} maxLength={50} pattern="[A-Za-z][A-Za-z0-9._-]*" /></label>
        <label className="text-sm">Adresse e-mail (facultative)<input className={input} type="email" value={email} onChange={event => setEmail(event.target.value)} maxLength={254} /></label>
      </div>
      {sectionChoices(sections, setSections)}
      <button type="submit" disabled={busy || sections.length === 0} className="site-button mt-5">Créer le compte et le lien</button>
    </form>
    <section><h2 className="font-serif text-2xl">Comptes de l’équipe</h2>
      {users.length ? <ul className="mt-4 space-y-3">{users.map(user => <li key={user.id} className="rounded-2xl bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{user.name}</p>{user.username ? <p className="text-sm text-emerald-900/70">Identifiant : {user.username}</p> : null}{user.email ? <p className="text-sm text-emerald-900/70">{user.email}</p> : null}</div><span className="text-sm">{user.active ? "Actif" : "Inactif ou en attente d’activation"}</span></div>
        {sectionChoices(draftSections[user.id] ?? user.sections, value => setDraftSections(current => ({ ...current, [user.id]: value })))}
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={busy || !draftSections[user.id]?.length} onClick={() => void saveSections(user.id)} className="site-button disabled:opacity-50">Enregistrer les droits</button><button type="button" disabled={busy} onClick={() => void change(user.id, "revoke")} className="rounded-full border px-4 py-2 text-sm disabled:opacity-50">Révoquer l’accès</button><button type="button" disabled={busy} onClick={() => void change(user.id, "invite")} className="rounded-full border px-4 py-2 text-sm">Créer un nouveau lien</button><button type="button" disabled={busy} onClick={() => void remove(user.id, user.name)} className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-800">Supprimer le compte</button></div>
      </li>)}</ul> : <p className="mt-3 text-sm">Aucun compte pour le moment.</p>}
    </section>
  </div>;
}

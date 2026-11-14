"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { adminSections, sectionLabels, RESTAURANT_ID, type AdminSection } from "@/lib/restaurant-admin/policy";

type Staff = { id: string; email: string | null; username: string | null; name: string; role: string; restaurantId: string; active: boolean; sections: AdminSection[]; createdAt: string };
const input = "mt-1 w-full rounded-lg border border-emerald-950/20 bg-white px-3 py-2 text-sm";

export function RestaurantAccessManager({ initialUsers, contentAvailable }: { initialUsers: Staff[]; contentAvailable: boolean }) {
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
  const [passwordUserId, setPasswordUserId] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0]?.id ?? "new");

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
      setSelectedUserId(data.id);
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
      if (selectedUserId === id) setSelectedUserId(users.find(user => user.id !== id)?.id ?? "new");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Suppression impossible."); }
    finally { setBusy(false); }
  }

  function toggle(current: AdminSection[], section: AdminSection, checked: boolean): AdminSection[] {
    return checked ? [...current, section] : current.filter(item => item !== section);
  }

  function sectionChoices(value: AdminSection[], onChange: (value: AdminSection[]) => void) {
    return <fieldset className="mt-4"><legend className="text-sm font-semibold">Rubriques autorisées</legend><div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{adminSections.map(section => {
      const unavailable = !contentAvailable && (section === "pages" || section === "media");
      return <label key={section} className="flex items-center gap-2 rounded-lg border border-emerald-950/10 p-3 text-sm"><input type="checkbox" disabled={unavailable} checked={value.includes(section)} onChange={event => onChange(toggle(value, section, event.target.checked))} />{sectionLabels[section]}{unavailable ? " (indisponible)" : ""}</label>;
    })}</div>{!contentAvailable ? <p className="mt-2 text-xs text-amber-900">Les pages et médias seront attribuables lorsque le stockage persistant du back-office sera configuré sur cet hébergement.</p> : null}</fieldset>;
  }

  async function change(id: string, action: "revoke" | "invite") {
    setBusy(true); setError(""); setMessage(""); setLink("");
    try {
      const response = await fetch(`/api/admin/restaurant-users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Modification impossible.");
      if (data.activationPath) setLink(`${location.origin}${data.activationPath}`);
      setMessage(action === "revoke" ? "Accès révoqué. Les sessions et invitations ont été annulées." : "Nouveau lien créé. Les anciennes sessions et invitations ont été annulées.");
      if (passwordUserId === id) closePasswordForm();
      await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Modification impossible."); }
    finally { setBusy(false); }
  }

  function closePasswordForm() {
    setPasswordUserId(null);
    setPassword("");
    setConfirmation("");
  }

  async function savePassword(event: FormEvent<HTMLFormElement>, user: Staff) {
    event.preventDefault(); setError(""); setMessage("");
    if (password !== confirmation) { setError("Les mots de passe ne correspondent pas."); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/restaurant-users/${user.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "password", password, confirmation }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Modification du mot de passe impossible.");
      closePasswordForm();
      setLink("");
      await refresh();
      setMessage(user.active
        ? `Mot de passe de ${user.name} modifié. Ses anciennes sessions ont été fermées.`
        : `Mot de passe de ${user.name} défini. Son accès est maintenant actif.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Modification du mot de passe impossible."); }
    finally { setBusy(false); }
  }

  const tabIds = [...users.map(user => user.id), "new"];
  const selectedTabId = tabIds.includes(selectedUserId) ? selectedUserId : tabIds[0];
  const selectedUser = users.find(user => user.id === selectedTabId);

  function selectUser(id: string) {
    closePasswordForm();
    setError("");
    setMessage("");
    setSelectedUserId(id);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, id: string) {
    const index = tabIds.indexOf(id);
    const nextIndex = event.key === "ArrowRight" ? (index + 1) % tabIds.length :
      event.key === "ArrowLeft" ? (index - 1 + tabIds.length) % tabIds.length :
      event.key === "Home" ? 0 : event.key === "End" ? tabIds.length - 1 : -1;
    if (nextIndex < 0) return;
    event.preventDefault();
    const nextId = tabIds[nextIndex];
    selectUser(nextId);
    document.getElementById(`staff-tab-${nextId}`)?.focus();
  }

  return <div className="mt-7 space-y-8">
    {message ? <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm">{message}</p> : null}
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
    {link ? <div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><label className="text-sm font-semibold">Lien d’activation personnel<input readOnly value={link} onFocus={event => event.currentTarget.select()} className={input} /></label><p className="mt-2 text-xs">Copiez ce lien maintenant : il n’est affiché qu’une fois et expire dans 24 heures.</p></div> : null}
    <section>
      <h2 className="font-serif text-2xl">Comptes de l’équipe</h2>
      <div role="tablist" aria-label="Choisir un compte" className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {users.map(user => <button key={user.id} id={`staff-tab-${user.id}`} type="button" role="tab" aria-controls="staff-panel" aria-selected={selectedTabId === user.id} tabIndex={selectedTabId === user.id ? 0 : -1} disabled={busy} onClick={() => selectUser(user.id)} onKeyDown={event => handleTabKeyDown(event, user.id)} className={`shrink-0 rounded-xl border px-4 py-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${selectedTabId === user.id ? "border-emerald-900 bg-emerald-950 text-white" : "border-emerald-950/15 bg-white hover:border-emerald-900"}`}>
          <span className="block font-semibold">{user.name}</span>
          <span className="block text-xs opacity-80">{user.username ?? user.email ?? "Compte sans identifiant"} · {user.active ? "Actif" : "Inactif"}</span>
        </button>)}
        <button id="staff-tab-new" type="button" role="tab" aria-controls="staff-panel" aria-selected={selectedTabId === "new"} tabIndex={selectedTabId === "new" ? 0 : -1} disabled={busy} onClick={() => selectUser("new")} onKeyDown={event => handleTabKeyDown(event, "new")} className={`shrink-0 rounded-xl border px-4 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${selectedTabId === "new" ? "border-emerald-900 bg-emerald-950 text-white" : "border-emerald-950/15 bg-white hover:border-emerald-900"}`}>+ Nouveau compte</button>
      </div>
      <div id="staff-panel" role="tabpanel" aria-labelledby={`staff-tab-${selectedTabId}`} tabIndex={0} className="rounded-2xl bg-white p-5 focus-visible:outline-2 focus-visible:outline-emerald-700">
        {selectedTabId === "new" ? <form onSubmit={create}>
          <h3 className="font-serif text-2xl">Créer un accès personnel</h3>
          <p className="mt-2 text-sm">Choisissez un identifiant unique. L’adresse e-mail est facultative. La personne pourra définir son mot de passe avec le lien d’activation, ou vous pourrez le faire depuis son compte.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Nom<input className={input} value={name} onChange={event => setName(event.target.value)} required maxLength={100} /></label>
            <label className="text-sm">Identifiant<input className={input} value={username} onChange={event => setUsername(event.target.value)} required minLength={3} maxLength={50} pattern="[A-Za-z][A-Za-z0-9._-]*" /></label>
            <label className="text-sm">Adresse e-mail (facultative)<input className={input} type="email" value={email} onChange={event => setEmail(event.target.value)} maxLength={254} /></label>
          </div>
          {sectionChoices(sections, setSections)}
          <button type="submit" disabled={busy || sections.length === 0} className="site-button mt-5">Créer le compte et le lien</button>
        </form> : selectedUser ? <>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-serif text-2xl">{selectedUser.name}</h3>{selectedUser.username ? <p className="text-sm text-emerald-900/70">Identifiant : {selectedUser.username}</p> : null}{selectedUser.email ? <p className="text-sm text-emerald-900/70">{selectedUser.email}</p> : null}</div><span className="text-sm">{selectedUser.active ? "Actif" : "Inactif ou en attente d’activation"}</span></div>
          {sectionChoices(draftSections[selectedUser.id] ?? selectedUser.sections, value => setDraftSections(current => ({ ...current, [selectedUser.id]: value })))}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" disabled={busy || !draftSections[selectedUser.id]?.length} onClick={() => void saveSections(selectedUser.id)} className="site-button disabled:opacity-50">Enregistrer les droits</button>
            <button type="button" disabled={busy} onClick={() => void change(selectedUser.id, "revoke")} className="rounded-full border px-4 py-2 text-sm disabled:opacity-50">Révoquer l’accès</button>
            <button type="button" disabled={busy} onClick={() => void change(selectedUser.id, "invite")} className="rounded-full border px-4 py-2 text-sm">Créer un nouveau lien</button>
            <button type="button" disabled={busy} onClick={() => { closePasswordForm(); setError(""); setPasswordUserId(selectedUser.id); }} className="rounded-full border px-4 py-2 text-sm disabled:opacity-50">{selectedUser.active ? "Changer le mot de passe" : "Définir un mot de passe et activer"}</button>
            <button type="button" disabled={busy} onClick={() => void remove(selectedUser.id, selectedUser.name)} className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-800">Supprimer le compte</button>
          </div>
          {passwordUserId === selectedUser.id ? <form onSubmit={event => void savePassword(event, selectedUser)} className="mt-4 rounded-xl border border-emerald-950/10 bg-emerald-50/50 p-4">
            <h4 className="font-semibold">Nouveau mot de passe pour {selectedUser.name}</h4>
            <p className="mt-1 text-xs">Au moins 13 caractères. {selectedUser.active ? "Les anciennes sessions seront fermées." : "Ce compte sera activé."} Communiquez le nouveau mot de passe à cette personne par un canal privé.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Nouveau mot de passe<input className={input} type="password" autoComplete="new-password" minLength={13} maxLength={256} required value={password} onChange={event => setPassword(event.target.value)} /></label>
              <label className="text-sm">Confirmer le mot de passe<input className={input} type="password" autoComplete="new-password" minLength={13} maxLength={256} required value={confirmation} onChange={event => setConfirmation(event.target.value)} /></label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3"><button type="submit" disabled={busy} className="site-button disabled:opacity-50">Enregistrer le nouveau mot de passe</button><button type="button" disabled={busy} onClick={closePasswordForm} className="rounded-full border px-4 py-2 text-sm">Annuler</button></div>
          </form> : null}
        </> : null}
      </div>
    </section>
  </div>;
}

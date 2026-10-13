"use client";

import { useState, type FormEvent } from "react";
import { contentActions, type ContentAction, type Grant, type Role } from "@/lib/backoffice/model";

type User = { id: string; email: string; name: string; role: Role; active: boolean; grants: Grant[] };
type Page = { id: string; slug: string };
const actionLabels: Record<ContentAction, string> = { view: "Consulter", create: "Créer", edit: "Modifier", delete: "Supprimer", submit: "Soumettre", publish: "Publier", restore: "Restaurer" };
const input = "mt-1 w-full rounded-lg border border-emerald-950/20 px-3 py-2 text-sm";

export function UserManager({ currentId, initialUsers, pages, audit }: { currentId: string; initialUsers: User[]; pages: Page[]; audit: { action: string; target: string; created_at: string }[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "contributor" as Role, grants: [] as Grant[] });
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage(""); setLink("");
    try { const response = await fetch("/api/backoffice/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newUser) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Création impossible."); setUsers(current => [...current, data.user]); setLink(`${location.origin}${data.activationPath}`); setMessage("Compte créé. Transmettez le lien d’activation à cette personne par un canal sûr."); setNewUser({ name: "", email: "", role: "contributor", grants: [] }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Création impossible."); }
    finally { setBusy(false); }
  }
  async function update(user: User, action: "update" | "revoke" | "reset") {
    setBusy(true); setError(""); setMessage(""); setLink("");
    try { const response = await fetch(`/api/backoffice/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, role: user.role, active: user.active, grants: user.grants }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Modification impossible."); if (data.activationPath) setLink(`${location.origin}${data.activationPath}`); setMessage(action === "reset" ? "Nouveau lien valable 24 h créé." : action === "revoke" ? "Sessions révoquées." : "Droits enregistrés. Les sessions précédentes ont été révoquées si nécessaire."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Modification impossible."); }
    finally { setBusy(false); }
  }
  function patch(id: string, changes: Partial<User>) { setUsers(current => current.map(user => user.id === id ? { ...user, ...changes } : user)); }
  return <div className="mt-8 space-y-8">
    {message ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p> : null}
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    {link ? <div className="rounded-xl border border-amber-300 bg-amber-50 p-4"><p className="text-sm font-semibold">Lien personnel à usage unique</p><input readOnly value={link} aria-label="Lien d’activation" className={input} onFocus={e => e.currentTarget.select()} /><p className="mt-2 text-xs">Ce lien expire dans 24 h. Il n’est affiché qu’une fois.</p></div> : null}
    <form onSubmit={create} className="rounded-2xl border bg-white p-5"><h2 className="font-serif text-2xl">Inviter une personne</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="text-sm">Nom<input className={input} required maxLength={100} value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} /></label><label className="text-sm">E-mail<input className={input} type="email" required maxLength={254} value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} /></label><label className="text-sm">Rôle<select className={input} value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as Role })}><option value="contributor">Contributeur</option><option value="editor">Éditeur</option><option value="admin">Administrateur</option></select></label></div><GrantEditor grants={newUser.grants} pages={pages} onChange={grants => setNewUser({ ...newUser, grants })} disabled={newUser.role === "admin"} /><button disabled={busy} className="site-button mt-4">Créer le compte</button></form>
    <section><h2 className="font-serif text-2xl">Comptes</h2><div className="mt-4 space-y-4">{users.map(user => <article key={user.id} className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-serif text-xl">{user.name}</h3><p className="text-sm text-emerald-900/70">{user.email}</p></div><span className={`rounded-full px-3 py-1 text-xs ${user.active ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-800"}`}>{user.active ? "Actif" : "Désactivé"}</span></div><div className="mt-4 flex flex-wrap gap-4"><label className="text-sm">Rôle<select disabled={user.id === currentId} className={input} value={user.role} onChange={e => patch(user.id, { role: e.target.value as Role })}><option value="contributor">Contributeur</option><option value="editor">Éditeur</option><option value="admin">Administrateur</option></select></label><label className="flex items-end gap-2 pb-2 text-sm"><input type="checkbox" disabled={user.id === currentId} checked={user.active} onChange={e => patch(user.id, { active: e.target.checked })} /> Accès actif</label></div>{user.id === currentId ? <div className="mt-3 flex flex-wrap items-center gap-3"><p className="text-xs text-emerald-900/60">Vos propres droits ne peuvent pas être modifiés ici.</p><button disabled={busy} onClick={() => void update(user, "reset")} className="rounded-full border px-4 py-2 text-sm">Changer mon mot de passe</button></div> : <><GrantEditor grants={user.grants} pages={pages} onChange={grants => patch(user.id, { grants })} disabled={user.role === "admin"} /><div className="mt-4 flex flex-wrap gap-3"><button disabled={busy} onClick={() => void update(user, "update")} className="site-button">Enregistrer</button><button disabled={busy} onClick={() => void update(user, "revoke")} className="rounded-full border px-4 py-2 text-sm">Révoquer les sessions</button><button disabled={busy} onClick={() => void update(user, "reset")} className="rounded-full border px-4 py-2 text-sm">Nouveau lien de mot de passe</button></div></>}</article>)}</div></section>
    <section><h2 className="font-serif text-2xl">Journal récent</h2><ul className="mt-4 divide-y rounded-2xl border bg-white px-5">{audit.map((item, index) => <li key={index} className="py-2 text-xs">{new Date(item.created_at).toLocaleString("fr-FR")} · {item.action} · {item.target}</li>)}</ul></section>
  </div>;
}

function GrantEditor({ grants, pages, onChange, disabled }: { grants: Grant[]; pages: Page[]; onChange: (grants: Grant[]) => void; disabled: boolean }) {
  const resources = [{ resource: "pages", label: "Toutes les pages" }, { resource: "media", label: "Médiathèque" }, ...pages.map(page => ({ resource: `page:${page.id}`, label: `/pages/${page.slug}` }))];
  function toggle(resource: string, action: ContentAction, checked: boolean) {
    const next = grants.filter(grant => grant.resource !== resource);
    const actions = grants.find(grant => grant.resource === resource)?.actions ?? [];
    const updated = checked ? [...actions, action] : actions.filter(item => item !== action);
    if (updated.length) next.push({ resource, actions: updated });
    onChange(next);
  }
  return <fieldset disabled={disabled} className="mt-4"><legend className="text-sm font-semibold">Permissions détaillées</legend>{disabled ? <p className="mt-1 text-xs text-emerald-900/60">Le rôle administrateur possède tous les droits.</p> : <div className="mt-2 space-y-3">{resources.map(item => <div key={item.resource} className="rounded-xl bg-[#f7f4e9] p-3"><p className="text-xs font-semibold">{item.label}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{contentActions.filter(action => item.resource === "media" ? ["view","create","delete"].includes(action) : item.resource === "pages" ? action === "create" || action === "view" || action === "edit" || action === "publish" || action === "restore" || action === "delete" || action === "submit" : action !== "create").map(action => <label key={action} className="flex items-center gap-1 text-xs"><input type="checkbox" checked={grants.some(grant => grant.resource === item.resource && grant.actions.includes(action))} onChange={e => toggle(item.resource, action, e.target.checked)} />{actionLabels[action]}</label>)}</div></div>)}</div>}</fieldset>;
}

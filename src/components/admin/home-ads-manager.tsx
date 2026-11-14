"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { DEFAULT_HOME_AD_SECONDS, HOME_AD_DURATION_OPTIONS, homeAds, visibleHomeAd, type ManagedHomeAd } from "@/data/home-ads";
import { MAX_AD_IMAGE_BYTES } from "@/lib/home-ads-validation";
import { AdminDialog } from "./dialog";

const button = "inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-950/20 px-5 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";
const field = "mt-1 block min-h-12 w-full rounded-xl border border-emerald-950/20 bg-stone-50 px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-emerald-700";
const sideLabels = { left: "À gauche", right: "À droite", both: "Des deux côtés" };
function status(ad: ManagedHomeAd, today: string) {
  if (!ad.enabled) return "Désactivée";
  if (ad.startsOn && ad.startsOn > today) return "Programmée";
  if (ad.endsOn && ad.endsOn < today) return "Terminée";
  return "En diffusion";
}
function formatDate(date: string) { return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)); }

export function HomeAdsManager({ initialAds, today, localMode }: { initialAds: ManagedHomeAd[]; today: string; localMode: boolean }) {
  const [ads, setAds] = useState(initialAds);
  const [editor, setEditor] = useState<ManagedHomeAd | null>(null);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const visible = ads.filter(ad => filter === "all" || ad.side === filter || ad.side === "both");
  const groups = (["left", "right", "both"] as const).map(side => ({
    side,
    items: visible.filter(ad => ad.side === side).sort((a, b) => a.position - b.position || a.id.localeCompare(b.id)),
  })).filter(group => group.items.length > 0);
  const active = ads.filter(ad => ad.enabled && visibleHomeAd(ad, today)).length;
  return <div className="mt-7 space-y-6">
    {localMode ? <p role="status" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Prévisualisation locale : les publicités et images sont enregistrées uniquement sur cet ordinateur. Le site en ligne n’est pas modifié.</p> : null}
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-emerald-950/10 bg-white p-5 sm:p-6"><div><h2 className="font-serif text-2xl">Vos annonces</h2><p className="mt-2 text-sm text-emerald-950/65">{ads.length} annonces enregistrées · {active} en diffusion aujourd’hui</p></div><button type="button" className={`${button} bg-emerald-900 text-white`} onClick={() => { setMessage(""); setEditor({ id: crypto.randomUUID(), advertiser: "", image: "", imageAlt: "", side: "left", enabled: true, position: Math.min(1000, ads.length * 10) }); }}>+ Ajouter une publicité</button></div>
    <div role="status" aria-live="polite" className={message ? "rounded-xl bg-emerald-100 p-4 text-sm" : "sr-only"}>{message}</div>
    <div className="flex flex-wrap items-end justify-between gap-4"><label className="text-sm font-medium">Emplacement<select className={field} value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Tous les emplacements</option><option value="left">À gauche</option><option value="right">À droite</option><option value="both">Des deux côtés</option></select></label><p className="max-w-xl text-sm leading-6 text-emerald-950/65">Les annonces sont classées par emplacement et par ordre de passage. Les dates de diffusion sont inclusives, à l’heure de Paris.</p></div>
    {groups.map(group => <section key={group.side} aria-label={`Annonces ${sideLabels[group.side].toLowerCase()}`}><h3 className="mb-3 font-serif text-xl">{sideLabels[group.side]}</h3><ul className="grid gap-5 xl:grid-cols-2">{group.items.map(ad => <li key={ad.id} className="flex flex-col overflow-hidden rounded-3xl border border-emerald-950/10 bg-white shadow-sm">
      <div className="relative h-56 border-b border-emerald-950/10 bg-stone-50"><Image src={ad.image} alt={ad.imageAlt} fill unoptimized sizes="600px" className="object-contain p-3" /></div>
      <div className="flex flex-1 flex-col p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Ordre {ad.position} · {ad.displaySeconds ?? DEFAULT_HOME_AD_SECONDS} s à l’écran</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${status(ad, today) === "En diffusion" ? "bg-emerald-100 text-emerald-900" : "bg-stone-100 text-stone-700"}`}>{status(ad, today)}</span></div><h4 className="mt-4 break-words font-serif text-2xl">{ad.advertiser}</h4>{ad.caption ? <p className="mt-2 break-words text-sm text-emerald-950/75">{ad.caption}</p> : null}<p className="mt-3 text-xs leading-6 text-emerald-950/60">{ad.startsOn ? `À partir du ${formatDate(ad.startsOn)}` : "Sans date de début"}{ad.endsOn ? ` · Jusqu’au ${formatDate(ad.endsOn)}` : " · Sans date de fin"}</p>{ad.url ? <p className="mt-2 break-all text-xs text-emerald-950/60">Lien : {ad.url}</p> : <p className="mt-2 text-xs text-emerald-950/60">Sans lien au clic</p>}<div className="mt-auto pt-5"><button type="button" aria-label={`Modifier ${ad.advertiser}`} className={button} onClick={() => { setMessage(""); setEditor(ad); }}>Modifier l’annonce</button></div></div>
    </li>)}</ul></section>)}
    {!visible.length ? <p className="rounded-2xl bg-white p-5 text-sm">Aucune annonce pour cet emplacement. Vous pouvez en ajouter une.</p> : null}
    <p className="text-xs leading-6 text-emerald-950/60">L’encart « Votre publicité ici » apparaît uniquement lorsqu’aucune annonce n’est en diffusion à cet emplacement.</p>
    {editor ? <AdEditor initial={editor} existing={ads.some(ad => ad.id === editor.id)} localMode={localMode} onClose={() => setEditor(null)} onSaved={saved => { setAds(current => [...current.filter(ad => ad.id !== saved.id), saved]); setEditor(null); setMessage(localMode ? "Annonce enregistrée dans la prévisualisation locale." : "Annonce enregistrée. L’accueil est à jour ; les dates de diffusion s’appliquent automatiquement."); }} /> : null}
  </div>;
}

function AdEditor({ initial, existing, localMode, onClose, onSaved }: { initial: ManagedHomeAd; existing: boolean; localMode: boolean; onClose: () => void; onSaved: (ad: ManagedHomeAd) => void }) {
  const [draft, setDraft] = useState(initial);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(initial.image);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const dirty = useRef(false);
  const submitting = useRef(false);
  const upload = useRef<HTMLInputElement>(null);
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    function preventLoss(event: BeforeUnloadEvent) { if (dirty.current) { event.preventDefault(); event.returnValue = ""; } }
    window.addEventListener("beforeunload", preventLoss);
    return () => window.removeEventListener("beforeunload", preventLoss);
  }, []);
  function close() { if (!submitting.current) { if (dirty.current) setDiscard(true); else onClose(); } }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    if (!draft.image && !image) { setError("Ajoutez une image ou choisissez un visuel existant."); return; }
    submitting.current = true; setBusy(true); setError("");
    const payload = new FormData();
    payload.set("ad", JSON.stringify(draft));
    if (image) payload.set("image", image);
    try {
      const result = await fetch("/api/admin/publicites", { method: "PUT", body: payload });
      const data = await result.json().catch(() => null);
      if (!result.ok || !data?.ad) throw new Error(data?.error || "Enregistrement impossible. Réessayez. Votre saisie est conservée.");
      dirty.current = false; onSaved(data.ad);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Enregistrement impossible. Votre saisie est conservée."); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <AdminDialog label={existing ? "Modifier la publicité" : "Ajouter une publicité"} wide onClose={close}>
    <div className="p-3 sm:p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Publicités de l’accueil</p><h2 className="mt-2 font-serif text-3xl">{existing ? "Modifier l’annonce" : "Nouvelle publicité"}</h2></div><button type="button" disabled={busy} className={button} onClick={close}>Fermer</button></div>
      {error ? <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      {discard ? <div role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm"><p>Fermer sans enregistrer vos modifications ?</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" className={button} onClick={onClose}>Abandonner les modifications</button><button type="button" className={button} onClick={() => setDiscard(false)}>Continuer la saisie</button></div></div> : null}
      <form onSubmit={save} onChange={() => { dirty.current = true; }} className="mt-6 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <fieldset disabled={busy || discard} className="grid min-w-0 gap-4 sm:grid-cols-2 disabled:opacity-60">
          <label className="text-sm font-medium sm:col-span-2">Titre / annonceur *<input autoFocus className={field} required maxLength={120} value={draft.advertiser} onChange={event => setDraft({ ...draft, advertiser: event.target.value })} /></label>
          <label className="text-sm font-medium sm:col-span-2">Sous-titre (facultatif)<input className={field} maxLength={240} value={draft.caption ?? ""} onChange={event => setDraft({ ...draft, caption: event.target.value })} /></label>
          <label className="text-sm font-medium">Emplacement<select className={field} value={draft.side} onChange={event => setDraft({ ...draft, side: event.target.value as ManagedHomeAd["side"] })}><option value="left">À gauche</option><option value="right">À droite</option><option value="both">Des deux côtés</option></select></label>
          <label className="text-sm font-medium">Ordre de passage (le plus petit en premier)<input className={field} type="number" required min={0} max={1000} step={1} value={draft.position} onChange={event => setDraft({ ...draft, position: Number(event.target.value) })} /></label>
          <label className="text-sm font-medium">Temps à l’écran<select className={field} value={draft.displaySeconds ?? DEFAULT_HOME_AD_SECONDS} onChange={event => setDraft({ ...draft, displaySeconds: Number(event.target.value) })}>{HOME_AD_DURATION_OPTIONS.map(seconds => <option key={seconds} value={seconds}>{seconds} secondes</option>)}</select></label>
          <label className="text-sm font-medium">Type d’annonce<select className={field} value={draft.kind ?? ""} onChange={event => setDraft({ ...draft, kind: event.target.value as ManagedHomeAd["kind"] })}><option value="">Publicité partenaire</option><option value="event">Événement</option><option value="house">Actualité du golf</option><option value="example">Exemple d’annonce</option></select></label>
          <label className="flex min-h-12 items-center gap-3 self-end rounded-xl border border-emerald-950/15 bg-emerald-50 px-4 text-sm font-semibold"><input type="checkbox" className="h-5 w-5 accent-emerald-800" checked={draft.enabled} onChange={event => setDraft({ ...draft, enabled: event.target.checked })} />Annonce activée</label>
          <label className="text-sm font-medium">Début de diffusion (facultatif)<input type="date" min="2026-01-01" max="2199-12-31" className={field} value={draft.startsOn ?? ""} onChange={event => setDraft({ ...draft, startsOn: event.target.value })} /></label>
          <label className="text-sm font-medium">Fin de diffusion (facultatif)<input type="date" min={draft.startsOn || "2026-01-01"} max="2199-12-31" className={field} value={draft.endsOn ?? ""} onChange={event => setDraft({ ...draft, endsOn: event.target.value })} /></label>
          <label className="text-sm font-medium sm:col-span-2">Lien au clic (facultatif)<input className={field} maxLength={1000} placeholder="https://… ou /contact" value={draft.url ?? ""} onChange={event => setDraft({ ...draft, url: event.target.value })} /></label>
          <div className="rounded-2xl border border-emerald-950/15 p-4 sm:col-span-2"><label className="block text-sm font-medium">Ajouter ou remplacer le visuel<input ref={upload} type="file" accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full max-w-full text-sm file:mr-3 file:min-h-11 file:rounded-full file:border file:border-emerald-950/20 file:bg-white file:px-4" onChange={event => { const file = event.target.files?.[0]; if (!file) return; if (file.size > MAX_AD_IMAGE_BYTES || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Choisissez une image JPEG, PNG ou WebP de 5 Mo maximum."); event.target.value = ""; return; } setImage(file); setPreview(URL.createObjectURL(file)); setError(""); }} /></label><p className="mt-2 text-xs leading-6 text-emerald-950/65">JPEG, PNG ou WebP · 5 Mo maximum · non animé. Le visuel est automatiquement allégé, sans recadrage.</p><label className="mt-4 block text-sm font-medium">Ou utiliser un visuel existant<select className={field} value={image ? "" : draft.image} onChange={event => { setImage(null); setPreview(event.target.value); setDraft({ ...draft, image: event.target.value }); if (upload.current) upload.current.value = ""; }}><option value="">Choisir un visuel</option>{draft.image && ![...homeAds.left, ...homeAds.right].some(ad => ad.image === draft.image) ? <option value={draft.image}>Visuel actuel</option> : null}{[...homeAds.left, ...homeAds.right].map(ad => <option key={ad.image} value={ad.image}>{ad.advertiser}</option>)}</select></label></div>
          <label className="text-sm font-medium sm:col-span-2">Description du visuel *<textarea className={field} rows={3} required maxLength={300} value={draft.imageAlt} onChange={event => setDraft({ ...draft, imageAlt: event.target.value })} /><span className="mt-1 block text-xs leading-6 text-emerald-950/65">Décrivez les informations utiles de l’image pour les personnes qui ne peuvent pas la voir.</span></label>
          <p className="text-xs leading-6 text-emerald-950/65 sm:col-span-2">* Champs obligatoires. {localMode ? "Les modifications restent sur cette copie locale." : "Enregistrer met à jour les publicités du site en ligne."}</p>
          <div className="flex flex-wrap gap-3 border-t border-emerald-950/10 pt-5 sm:col-span-2"><button type="submit" className={`${button} bg-emerald-900 text-white`}>{busy ? "Enregistrement…" : "Enregistrer l’annonce"}</button><button type="button" className={button} onClick={close}>Annuler</button></div>
        </fieldset>
        <aside aria-label="Aperçu de l’annonce" className="order-first rounded-3xl border border-emerald-950/15 bg-stone-50 p-5 lg:sticky lg:top-2 lg:order-last"><p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Aperçu</p><div className="relative mt-4 h-72 overflow-hidden rounded-2xl border border-emerald-950/10 bg-white">{preview ? <Image src={preview} alt={draft.imageAlt || "Aperçu du visuel publicitaire"} fill unoptimized sizes="320px" className="object-contain" /> : <span className="flex h-full items-center justify-center p-5 text-center text-sm text-emerald-950/50">Ajoutez le visuel de votre annonce.</span>}</div><h3 className="mt-4 break-words font-serif text-xl">{draft.advertiser || "Titre de l’annonce"}</h3>{draft.caption ? <p className="mt-2 break-words text-sm text-emerald-950/70">{draft.caption}</p> : null}<p className="mt-4 text-xs text-emerald-950/60">{sideLabels[draft.side]} · {draft.enabled ? "Activée selon les dates choisies" : "Désactivée"}</p></aside>
      </form>
    </div>
  </AdminDialog>;
}

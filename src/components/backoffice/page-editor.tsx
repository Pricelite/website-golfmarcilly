"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Block, PageContent } from "@/lib/backoffice/model";

type History = { revision: number; action: string; author: string; created_at: string };
type Permissions = { edit: boolean; submit: boolean; publish: boolean; restore: boolean; delete: boolean; media: boolean };
type Props = { id: string; slug: string; initialContent: PageContent; initialRevision: number; initialPublishedRevision: number | null; initialReviewRequested: boolean; history: History[]; permissions: Permissions };
const field = "mt-1 w-full rounded-xl border border-emerald-950/20 bg-white px-3 py-2 text-sm text-emerald-950";

export function PageEditor({ id, slug, initialContent, initialRevision, initialPublishedRevision, initialReviewRequested, history, permissions }: Props) {
  const [content, setContent] = useState(initialContent);
  const [revision, setRevision] = useState(initialRevision);
  const [publishedRevision, setPublishedRevision] = useState(initialPublishedRevision);
  const [reviewRequested, setReviewRequested] = useState(initialReviewRequested);
  const [savedContent, setSavedContent] = useState(JSON.stringify(initialContent));
  const [media, setMedia] = useState<{ id: string; filename: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dirty = JSON.stringify(content) !== savedContent;
  useEffect(() => { if (permissions.media) void fetch("/api/backoffice/media").then(r => r.ok ? r.json() : { media: [] }).then(data => setMedia(data.media ?? [])).catch(() => {}); }, [permissions.media]);

  function patchBlock(blockId: string, patch: Partial<Block>) {
    setContent(current => ({ ...current, blocks: current.blocks.map(block => block.id === blockId ? { ...block, ...patch } as Block : block) }));
  }
  function addBlock(type: Block["type"]) {
    const id = crypto.randomUUID();
    const block: Block = type === "heading" ? { id, type, text: "Nouveau titre", level: 2 } :
      type === "text" ? { id, type, text: "Votre texte…" } :
      type === "image" ? { id, type, mediaId: media[0]?.id ?? "", alt: "" } :
      { id, type, text: "En savoir plus", href: "/" };
    setContent(current => ({ ...current, blocks: [...current.blocks, block] }));
  }
  async function action(name: "save" | "submit" | "publish" | "restore", restoreRevision?: number) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/backoffice/pages/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: name, expectedRevision: revision, content: name === "save" ? content : undefined, revision: restoreRevision }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Opération impossible.");
      if (name === "save") { setRevision(data.draftRevision); setSavedContent(JSON.stringify(content)); setReviewRequested(false); setMessage("Brouillon enregistré."); }
      if (name === "submit") { setReviewRequested(true); setMessage("Validation demandée."); }
      if (name === "publish") { setPublishedRevision(data.publishedRevision); setReviewRequested(false); setMessage("Page publiée sur le site."); }
      if (name === "restore") { location.reload(); return; }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Opération impossible."); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!confirm("Supprimer cette page et son historique ? Cette action est définitive.")) return;
    setBusy(true); setError("");
    try { const response = await fetch(`/api/backoffice/pages/${id}`, { method: "DELETE" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Suppression impossible."); location.assign("/admin/contenu"); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Suppression impossible."); setBusy(false); }
  }
  return <div>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-700">Éditeur de page</p><h1 className="mt-2 font-serif text-3xl text-emerald-950">{content.title}</h1><p className="mt-2 text-sm text-emerald-900/60">/pages/{slug} · brouillon v{revision}{publishedRevision ? ` · publié v${publishedRevision}` : " · non publié"}{reviewRequested ? " · en validation" : ""}</p></div><div className="flex gap-2"><Link className="rounded-full border px-4 py-2 text-sm" href={`/admin/contenu/apercu/${id}`} target="_blank">Aperçu privé ↗</Link>{publishedRevision ? <Link className="rounded-full border px-4 py-2 text-sm" href={`/pages/${slug}`} target="_blank">Page publique ↗</Link> : null}</div></div>
    {message ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{message}</p> : null}
    {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="space-y-6">
        <section className="rounded-2xl border bg-white p-5"><h2 className="font-serif text-xl">Informations de la page</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">Titre visible<input disabled={!permissions.edit} className={field} maxLength={120} value={content.title} onChange={e => setContent({ ...content, title: e.target.value })} /></label>
          <label className="text-sm">Ambiance<select disabled={!permissions.edit} className={field} value={content.theme} onChange={e => setContent({ ...content, theme: e.target.value as PageContent["theme"] })}><option value="cream">Crème</option><option value="green">Vert profond</option><option value="white">Blanc</option></select></label>
          <label className="text-sm">Titre SEO<input disabled={!permissions.edit} className={field} maxLength={120} value={content.seoTitle} onChange={e => setContent({ ...content, seoTitle: e.target.value })} /></label>
          <label className="text-sm">Description SEO<input disabled={!permissions.edit} className={field} maxLength={320} value={content.seoDescription} onChange={e => setContent({ ...content, seoDescription: e.target.value })} /></label>
        </div></section>
        <section><h2 className="font-serif text-2xl">Sections et blocs</h2><div className="mt-4 space-y-4">{content.blocks.map((block, index) => <div key={block.id} className="rounded-2xl border bg-white p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{block.type === "heading" ? "Titre" : block.type === "text" ? "Texte" : block.type === "image" ? "Image" : "Bouton"} · {index + 1}</h3>{permissions.edit ? <div className="flex gap-2 text-xs"><button type="button" disabled={index === 0 || busy} onClick={() => setContent(current => ({ ...current, blocks: move(current.blocks, index, -1) }))}>↑</button><button type="button" disabled={index === content.blocks.length - 1 || busy} onClick={() => setContent(current => ({ ...current, blocks: move(current.blocks, index, 1) }))}>↓</button><button type="button" onClick={() => setContent(current => ({ ...current, blocks: current.blocks.filter(item => item.id !== block.id) }))} className="text-red-700">Supprimer</button></div> : null}</div>
          {block.type === "heading" ? <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_100px]"><label className="text-sm">Titre<input disabled={!permissions.edit} className={field} value={block.text} maxLength={200} onChange={e => patchBlock(block.id, { text: e.target.value })} /></label><label className="text-sm">Niveau<select disabled={!permissions.edit} className={field} value={block.level} onChange={e => patchBlock(block.id, { level: Number(e.target.value) as 2 | 3 })}><option value="2">H2</option><option value="3">H3</option></select></label></div> : null}
          {block.type === "text" ? <label className="mt-3 block text-sm">Texte<textarea disabled={!permissions.edit} className={field} rows={5} maxLength={6000} value={block.text} onChange={e => patchBlock(block.id, { text: e.target.value })} /></label> : null}
          {block.type === "image" ? <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm">Image<select disabled={!permissions.edit} className={field} value={block.mediaId} onChange={e => patchBlock(block.id, { mediaId: e.target.value })}><option value="">Choisir une image</option>{media.map(item => <option key={item.id} value={item.id}>{item.filename}</option>)}</select></label><label className="text-sm">Texte alternatif<input disabled={!permissions.edit} className={field} value={block.alt} maxLength={240} onChange={e => patchBlock(block.id, { alt: e.target.value })} /></label>{block.mediaId ? <Image src={`/api/backoffice/media/${block.mediaId}`} alt={block.alt} width={480} height={270} unoptimized className="max-h-48 rounded-xl object-cover" /> : null}</div> : null}
          {block.type === "button" ? <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm">Texte<input disabled={!permissions.edit} className={field} value={block.text} maxLength={100} onChange={e => patchBlock(block.id, { text: e.target.value })} /></label><label className="text-sm">Lien interne ou HTTPS<input disabled={!permissions.edit} className={field} value={block.href} maxLength={500} onChange={e => patchBlock(block.id, { href: e.target.value })} /></label></div> : null}
        </div>)}</div>{permissions.edit ? <div className="mt-4 flex flex-wrap gap-2">{(["heading", "text", "image", "button"] as const).map(type => <button type="button" key={type} onClick={() => addBlock(type)} className="rounded-full border border-emerald-950/20 px-3 py-2 text-xs">+ {type === "heading" ? "Titre" : type === "text" ? "Texte" : type === "image" ? "Image" : "Bouton"}</button>)}</div> : null}</section>
      </div>
      <aside className="space-y-5"><section className="rounded-2xl border bg-white p-5"><h2 className="font-serif text-xl">Publication</h2><p className="mt-2 text-xs leading-5 text-emerald-900/70">Enregistrez avant l’aperçu ou la publication. Les visiteurs ne voient que la dernière version publiée.</p><div className="mt-4 grid gap-2">{permissions.edit ? <button disabled={busy || !dirty} onClick={() => void action("save")} className="site-button disabled:opacity-50">Enregistrer le brouillon</button> : null}{permissions.submit ? <button disabled={busy || dirty || reviewRequested} onClick={() => void action("submit")} className="rounded-full border px-4 py-2 text-sm disabled:opacity-50">Envoyer pour validation</button> : null}{permissions.publish ? <button disabled={busy || dirty || publishedRevision === revision} onClick={() => void action("publish")} className="rounded-full bg-emerald-900 px-4 py-2 text-sm text-white disabled:opacity-50">Publier</button> : null}</div></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="font-serif text-xl">Historique</h2><ul className="mt-3 space-y-3 text-xs">{history.map(item => <li key={item.revision} className="border-t pt-2">v{item.revision} · {item.action} · {item.author} · {new Date(item.created_at).toLocaleString("fr-FR")}{permissions.restore ? <button disabled={busy || dirty} onClick={() => void action("restore", item.revision)} className="ml-2 underline disabled:opacity-50">Restaurer en brouillon</button> : null}</li>)}</ul></section>
      {permissions.delete ? <button type="button" disabled={busy} onClick={() => void remove()} className="text-sm text-red-700 underline">Supprimer la page</button> : null}
      </aside>
    </div>
  </div>;
}

function move(blocks: Block[], index: number, direction: -1 | 1): Block[] {
  const next = [...blocks];
  [next[index], next[index + direction]] = [next[index + direction], next[index]];
  return next;
}

"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";

type Media = { id: string; filename: string; mime: string; size: number };
export function MediaManager({ initialMedia, mayCreate, mayDelete }: { initialMedia: Media[]; mayCreate: boolean; mayDelete: boolean }) {
  const [media, setMedia] = useState(initialMedia);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/backoffice/media", { method: "POST", body: new FormData(event.currentTarget) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Envoi impossible.");
      setMedia(current => [data.media, ...current]); event.currentTarget.reset();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Envoi impossible."); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!confirm("Supprimer cette image ?")) return;
    setBusy(true); setError("");
    try { const response = await fetch(`/api/backoffice/media/${id}`, { method: "DELETE" }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Suppression impossible."); setMedia(current => current.filter(item => item.id !== id)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Suppression impossible."); }
    finally { setBusy(false); }
  }
  return <div className="mt-8">{mayCreate ? <form onSubmit={upload} className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-5"><label className="text-sm">Ajouter une image<input name="file" type="file" accept="image/jpeg,image/png,image/webp" required className="mt-2 block" /></label><button className="site-button" disabled={busy}>Téléverser</button></form> : null}{error ? <p role="alert" className="mt-4 text-sm text-red-700">{error}</p> : null}<ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{media.map(item => <li key={item.id} className="overflow-hidden rounded-2xl border bg-white"><Image src={`/api/backoffice/media/${item.id}`} alt="" width={600} height={350} unoptimized className="h-44 w-full object-cover" /><div className="p-4"><p className="truncate text-sm font-semibold">{item.filename}</p><p className="mt-1 text-xs text-emerald-900/60">{Math.round(item.size / 1024)} Ko</p><p className="mt-1 break-all text-xs text-emerald-900/50">{item.id}</p>{mayDelete ? <button type="button" disabled={busy} onClick={() => void remove(item.id)} className="mt-3 text-xs text-red-700 underline">Supprimer</button> : null}</div></li>)}</ul></div>;
}

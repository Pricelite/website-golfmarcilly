"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { feedbackTypes, MAX_FEEDBACK_LENGTH } from "@/lib/admin-feedback/model";

export function AdminFeedback() {
  const dialog = useRef<HTMLDialogElement>(null);
  const sending = useRef(false);
  const context = useRef({ page: "/", openedAt: 0 });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState<string>("Remarque");
  const previousOverflow = useRef("");

  function open() {
    if (sent) { setSent(false); setMessage(""); setEmail(""); setType("Remarque"); }
    setError("");
    context.current = { page: window.location.pathname, openedAt: Date.now() };
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const website = String(new FormData(event.currentTarget).get("website") || "");
    sending.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin-feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, email, website, ...context.current }),
      });
      const data = await response.json();
      if (!response.ok || data.ok !== true) {
        setError(response.status === 429
          ? "Ce message est déjà en cours d’envoi, ou la limite d’envois est atteinte. Patientez quelques minutes."
          : response.status === 400 || response.status === 413
            ? "Vérifiez les champs, patientez quelques secondes puis réessayez. Le message est limité à 4 000 caractères."
            : "L’envoi a échoué. Votre texte est conservé. Réessayez plus tard.");
        return;
      }
      setSent(true);
    } catch {
      setError("L’envoi a échoué. Vérifiez votre connexion puis réessayez. Votre texte est conservé.");
    } finally { sending.current = false; setBusy(false); }
  }
  const field = "mt-2 block w-full rounded-xl border border-emerald-950/25 bg-white px-3 py-3 text-base text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";
  return <>
    <button type="button" onClick={open} aria-haspopup="dialog" className="min-h-11 rounded-full border border-stone-100/40 px-4 py-2 text-sm text-stone-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Contacter l’administrateur</button>
    <dialog ref={dialog} aria-labelledby="admin-feedback-title" aria-describedby="admin-feedback-description"
      onClose={() => { document.body.style.overflow = previousOverflow.current; }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-emerald-950/15 bg-[#f8f5eb] p-5 text-left text-emerald-950 shadow-2xl backdrop:bg-emerald-950/65 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <h2 id="admin-feedback-title" className="font-serif text-2xl sm:text-3xl">Contacter l’administrateur</h2>
        <button type="button" onClick={() => dialog.current?.close()} aria-label="Fermer le formulaire" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-950/20 text-xl focus-visible:outline-2 focus-visible:outline-emerald-700">×</button>
      </div>
      <p id="admin-feedback-description" className="mt-3 text-sm leading-6">Une remarque sur le site ou un problème à signaler ? Décrivez-le ici.</p>
      {sent ? <div role="status" className="mt-6 rounded-xl border border-emerald-700/25 bg-emerald-50 p-4"><p>Votre message a bien été envoyé à l’administrateur. Merci pour votre retour.</p><button type="button" onClick={() => dialog.current?.close()} className="site-button site-button-primary mt-4 inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold">Fermer</button></div> :
        <form onSubmit={submit} aria-busy={busy} className="mt-6 space-y-5">
          <fieldset disabled={busy} className="space-y-5 disabled:opacity-70">
            <label className="block text-sm font-semibold">Type de message<select value={type} onChange={e => setType(e.target.value)} className={field}>{feedbackTypes.map(value => <option key={value}>{value}</option>)}</select></label>
            <label className="block text-sm font-semibold">Message (obligatoire)<textarea value={message} onChange={e => setMessage(e.target.value)} required maxLength={MAX_FEEDBACK_LENGTH} rows={5} aria-describedby="feedback-count" className={field} /></label>
            <p id="feedback-count" className="text-right text-xs text-emerald-950/70">{message.length} / {MAX_FEEDBACK_LENGTH} caractères</p>
            <label className="block text-sm font-semibold">Votre e-mail (facultatif)<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} aria-describedby="feedback-email-help" className={field} /></label>
            <p id="feedback-email-help" className="text-xs leading-5">Renseignez votre e-mail uniquement si vous souhaitez une réponse.</p>
            <div hidden aria-hidden="true"><label>Site internet<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
          </fieldset>
          <p className="text-xs leading-5 text-emerald-950/75">Le message, la page consultée et la date sont transmis à l’administrateur pour traiter votre retour. <Link href="/politique-de-confidentialite" onClick={() => dialog.current?.close()} className="underline underline-offset-2">Confidentialité</Link>.</p>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
          <button disabled={busy} type="submit" className="site-button site-button-primary inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-60">{busy ? "Envoi en cours…" : "Envoyer le message"}</button>
        </form>}
    </dialog>
  </>;
}

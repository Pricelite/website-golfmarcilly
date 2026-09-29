"use client";

import { useCallback, useEffect, useState } from "react";
import { INITIATION_PRICE_PER_PERSON_CENTS } from "@/lib/initiation/constants";
import type { InitiationOption } from "@/lib/initiation/calendar-options";

const field = "mt-2 w-full min-w-0 rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";

export default function InitiationReservationForm() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [participants, setParticipants] = useState(1);
  const [meal, setMeal] = useState<"WITH_MEAL" | "WITHOUT_MEAL">("WITHOUT_MEAL");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [slots, setSlots] = useState<InitiationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarError, setCalendarError] = useState("");
  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/initiation-options", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Impossible de charger le planning.");
      setSlots(result.slots);
      setCalendarError("");
    } catch (cause) {
      setSlots([]);
      setCalendarError(cause instanceof Error ? cause.message : "Impossible de charger le planning.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void loadSlots();
    const timer = window.setInterval(() => { void loadSlots(); }, 60_000);
    return () => window.clearInterval(timer);
  }, [loadSlots]);
  const dates = [...new Set(slots.map(slot => slot.date))];
  const selectedDate = dates.includes(date) ? date : "";
  const times = slots.filter(slot => slot.date === selectedDate).map(slot => slot.time);
  const selectedTime = times.includes(time) ? time : "";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || success || loading || !selectedDate || !selectedTime || calendarError) return;
    const form = new FormData(event.currentTarget);
    setSending(true); setError("");
    try {
      const response = await fetch("/api/reservations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime: time, participantsCount: participants, mealOption: meal, fullName: form.get("fullName"), email: form.get("email"), phone: form.get("phone"), note: form.get("note") }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        if (response.status === 409) { setTime(""); void loadSlots(); }
        throw new Error(result.error || "L’envoi a échoué. Merci de réessayer.");
      }
      setSuccess(result.message);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Impossible d’envoyer votre demande."); }
    finally { setSending(false); }
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-2">
      <fieldset disabled={sending || Boolean(success)} className="min-w-0 rounded-[32px] border border-emerald-900/10 bg-white/90 p-6 shadow-xl shadow-emerald-900/10 sm:p-8">
        <legend className="sr-only">Date et horaire souhaités</legend>
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">Étape 1</p>
        <h2 className="mt-4 font-serif text-3xl text-emerald-950">Votre initiation souhaitée</h2>
        <p className="mt-3 text-sm leading-7 text-emerald-900/75">Choisissez parmi les créneaux d’initiation proposés dans l’agenda pour les six prochains mois. Notre équipe confirmera votre demande par e-mail.</p>
        {loading ? <p role="status" className="mt-4 text-sm text-emerald-900">Actualisation des créneaux…</p> : null}
        {calendarError ? <p role="alert" className="mt-4 text-sm text-red-800">{calendarError}</p> : null}
        {!loading && !calendarError && slots.length === 0 ? <p role="status" className="mt-4 text-sm text-emerald-900">Aucun créneau d’initiation n’est proposé pour le moment.</p> : null}
        <button type="button" onClick={() => { void loadSlots(); }} disabled={loading} className="site-button mt-3 rounded-full px-4 py-2 text-sm disabled:opacity-50">Actualiser les créneaux</button>
        <div className="mt-6 space-y-5 text-sm text-emerald-900">
          <label className="block">Date souhaitée<select required disabled={dates.length === 0} value={selectedDate} onChange={e => { setDate(e.target.value); setTime(""); }} className={field}><option value="">Choisir une date</option>{dates.map(day => <option key={day} value={day}>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeZone: "Europe/Paris" }).format(new Date(`${day}T12:00:00Z`))}</option>)}</select></label>
          <fieldset>
            <legend>Horaire souhaité</legend>
            {!selectedDate ? <p className="mt-2 text-sm text-emerald-900/70">Choisissez d’abord une date pour afficher les horaires proposés.</p> : (
              <div className="mt-2 flex flex-wrap gap-3">
                {times.map(hour => (
                  <label key={`${selectedDate}-${hour}`} className="cursor-pointer">
                    <input type="radio" name="desiredTime" value={hour} checked={selectedTime === hour} onChange={() => setTime(hour)} required className="peer sr-only" />
                    <span className="inline-flex min-h-12 min-w-24 items-center justify-center rounded-2xl border border-emerald-900/20 bg-white px-5 py-3 font-semibold peer-checked:border-emerald-900 peer-checked:bg-emerald-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2">{hour}</span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
          <label className="block">Participants<select value={participants} onChange={e => setParticipants(Number(e.target.value))} className={field}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></label>
          <label className="block">Formule<select value={meal} onChange={e => setMeal(e.target.value as typeof meal)} className={field}><option value="WITHOUT_MEAL">Sans repas — 25 € / personne</option><option value="WITH_MEAL">Avec repas — 48 € / personne</option></select></label>
          <p className="rounded-2xl bg-emerald-50 p-4">Total estimé : <strong>{participants * INITIATION_PRICE_PER_PERSON_CENTS[meal] / 100} €</strong><br />Paiement sur place, après confirmation par notre équipe.</p>
        </div>
      </fieldset>
      <section className="min-w-0 rounded-[32px] border border-emerald-900/10 bg-white/90 p-6 shadow-xl shadow-emerald-900/10 sm:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">Étape 2</p>
        <h2 className="mt-4 font-serif text-3xl text-emerald-950">Envoyer votre demande</h2>
        <fieldset disabled={sending || Boolean(success)} className="mt-6 space-y-4 text-sm text-emerald-900">
          <legend className="sr-only">Vos coordonnées</legend>
          <label className="block">Nom et prénom<input name="fullName" autoComplete="name" maxLength={120} required className={field} /></label>
          <label className="block">E-mail<input name="email" type="email" autoComplete="email" maxLength={160} required className={field} /></label>
          <label className="block">Téléphone<input name="phone" type="tel" autoComplete="tel" maxLength={30} required className={field} /></label>
          <label className="block">Commentaire (facultatif)<textarea name="note" rows={3} maxLength={2000} className={field} /></label>
          <p className="leading-6">Cette demande ne vaut pas réservation. Nous vous répondrons par e-mail pour confirmer la date et l’horaire.</p>
          <button type="submit" disabled={loading || !selectedDate || !selectedTime || Boolean(calendarError)} className="site-button w-full rounded-full px-5 py-3 font-semibold disabled:opacity-60">{sending ? "Envoi en cours…" : success ? "Demande envoyée" : "Envoyer ma demande de réservation"}</button>
        </fieldset>
        {error ? <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
        {success ? <p role="status" className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">{success}</p> : null}
      </section>
    </form>
  );
}

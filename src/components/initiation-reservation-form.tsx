"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FormPrivacyNotice } from "@/components/forms/form-privacy-notice";
import { INITIATION_PRICE_PER_PERSON_CENTS, type InitiationMealOption } from "@/lib/initiation/constants";
import type { InitiationOption } from "@/lib/initiation/calendar-options";
import { InitiationDatePicker } from "@/components/initiation-date-picker";
import { siteConfig } from "@/data/site";

const field = "mt-2 w-full min-w-0 rounded-2xl border border-emerald-900/15 bg-white px-4 py-3 text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-300";

export default function InitiationReservationForm({ initialMeal = "WITHOUT_MEAL" }: { initialMeal?: InitiationMealOption }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [participants, setParticipants] = useState(1);
  const [meal, setMeal] = useState<InitiationMealOption>(initialMeal);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [stepError, setStepError] = useState("");
  const [success, setSuccess] = useState("");
  const [slots, setSlots] = useState<InitiationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarError, setCalendarError] = useState("");
  const firstHeading = useRef<HTMLHeadingElement>(null);
  const secondHeading = useRef<HTMLHeadingElement>(null);
  const hasChangedStep = useRef(false);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/initiation-options", { cache: "no-store", signal: AbortSignal.timeout(20_000) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Impossible de charger le planning.");
      setSlots(result.slots);
      setCalendarError("");
    } catch {
      setSlots([]);
      setCalendarError("Le planning est momentanément indisponible.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void loadSlots();
    const timer = window.setInterval(() => { void loadSlots(); }, 60_000);
    return () => window.clearInterval(timer);
  }, [loadSlots]);

  useEffect(() => {
    if (!hasChangedStep.current) { hasChangedStep.current = true; return; }
    (step === 1 ? firstHeading : secondHeading).current?.focus();
  }, [step]);

  const dates = [...new Set(slots.map(slot => slot.date))];
  const selectedDate = dates.includes(date) ? date : "";
  const times = slots.filter(slot => slot.date === selectedDate).map(slot => slot.time);
  const selectedTime = times.includes(time) ? time : "";
  const total = participants * INITIATION_PRICE_PER_PERSON_CENTS[meal] / 100;
  const formattedDate = selectedDate
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${selectedDate}T12:00:00Z`))
    : "";

  function continueToContact() {
    if (loading || calendarError || !selectedDate || !selectedTime) {
      setStepError("Choisissez une date et un horaire pour continuer.");
      return;
    }
    setStepError("");
    setStep(2);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== 2 || sending || success || loading || !selectedDate || !selectedTime || calendarError) return;
    const form = new FormData(event.currentTarget);
    setSending(true); setError("");
    try {
      const response = await fetch("/api/reservations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, startTime: selectedTime, participantsCount: participants, mealOption: meal, firstName: form.get("firstName"), lastName: form.get("lastName"), email: form.get("email"), phone: form.get("phone"), note: form.get("note") }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        if (response.status === 409 && result.code !== "duplicate") {
          setTime("");
          setStep(1);
          void loadSlots();
        }
        throw new Error(result.error || "L’envoi a échoué. Merci de réessayer.");
      }
      setSuccess(result.message);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Impossible d’envoyer votre demande."); }
    finally { setSending(false); }
  }

  return (
    <form id="choisir-initiation" onSubmit={submit} className="mx-auto max-w-3xl scroll-mt-28">
      <div className="mb-5 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-950">
        <p aria-live="polite" className="font-semibold">Étape {step} sur 2 · {step === 1 ? "Votre initiation" : "Vos coordonnées"}</p>
        <div aria-hidden="true" className="mt-3 grid grid-cols-2 gap-2">
          <span className="h-1.5 rounded-full bg-emerald-800" />
          <span className={`h-1.5 rounded-full ${step === 2 ? "bg-emerald-800" : "bg-emerald-950/15"}`} />
        </div>
      </div>

      <fieldset hidden={step !== 1} disabled={step !== 1 || sending || Boolean(success)} className="min-w-0 rounded-[28px] border border-emerald-900/10 bg-white p-5 shadow-xl shadow-emerald-900/10 sm:p-8">
        <legend className="sr-only">Choisir votre initiation</legend>
        <h2 ref={firstHeading} tabIndex={-1} className="font-serif text-3xl text-emerald-950 focus:outline-none">Quand souhaitez-vous venir ?</h2>
        <p className="mt-2 text-sm leading-6 text-emerald-900/75">Choisissez un créneau et votre formule. L’équipe confirmera votre demande par e-mail. Les demandes ferment 48 h avant le début du créneau.</p>
        {loading ? <p role="status" className="mt-4 text-sm text-emerald-900">Actualisation des créneaux…</p> : null}
        {calendarError ? <p role="alert" className="mt-4 text-sm text-red-800">{calendarError} Réessayez ou appelez le <a className="underline" href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>.</p> : null}
        {!loading && !calendarError && slots.length === 0 ? <p role="status" className="mt-4 text-sm text-emerald-900">Aucun créneau d’initiation n’est proposé pour le moment.</p> : null}
        <button type="button" onClick={() => { void loadSlots(); }} disabled={loading} className="site-button mt-3 rounded-full px-4 py-2 text-sm disabled:opacity-50">Actualiser les créneaux</button>
        <div className="mt-6 space-y-5 text-sm text-emerald-900">
          <InitiationDatePicker dates={dates} value={selectedDate} onChange={day => { setDate(day); setTime(""); setStepError(""); }} disabled={loading} />
          <fieldset>
            <legend>Horaire souhaité</legend>
            {!selectedDate ? <p className="mt-2 text-sm text-emerald-900/70">Choisissez d’abord une date pour afficher les horaires.</p> : (
              <div className="mt-2 flex flex-wrap gap-3">
                {times.map(hour => (
                  <label key={`${selectedDate}-${hour}`} className="cursor-pointer">
                    <input type="radio" name="desiredTime" value={hour} checked={selectedTime === hour} onChange={() => { setTime(hour); setStepError(""); }} className="peer sr-only" />
                    <span className="inline-flex min-h-12 min-w-24 items-center justify-center rounded-2xl border border-emerald-900/20 bg-white px-5 py-3 font-semibold peer-checked:border-emerald-900 peer-checked:bg-emerald-900 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2">{hour}</span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">Participants<select value={participants} onChange={event => setParticipants(Number(event.target.value))} className={field}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></label>
            <label className="block">Formule<select value={meal} onChange={event => setMeal(event.target.value as InitiationMealOption)} className={field}><option value="WITHOUT_MEAL">Sans repas — 25 € / personne</option><option value="WITH_MEAL">Avec repas — 48 € / personne</option></select></label>
          </div>
          <p className="rounded-2xl bg-emerald-50 p-4">Total estimé : <strong>{total} €</strong><br />Paiement sur place après confirmation.</p>
        </div>
        {stepError ? <p role="alert" className="mt-4 text-sm text-red-800">{stepError}</p> : null}
        {error ? <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
        <button type="button" onClick={continueToContact} disabled={loading || Boolean(calendarError) || slots.length === 0} className="site-button site-button-primary mt-6 w-full rounded-full px-5 py-3 font-semibold disabled:opacity-60 sm:w-auto">Continuer</button>
      </fieldset>

      <section hidden={step !== 2} className="min-w-0 rounded-[28px] border border-emerald-900/10 bg-white p-5 shadow-xl shadow-emerald-900/10 sm:p-8">
        <h2 ref={secondHeading} tabIndex={-1} className="font-serif text-3xl text-emerald-950 focus:outline-none">Comment vous joindre ?</h2>
        {!loading && (calendarError || !selectedDate || !selectedTime) ? <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">Ce créneau n’est plus disponible. Revenez au choix de la date et de l’horaire.</p> : null}
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
          <p className="font-semibold">Votre choix</p>
          <p>{formattedDate} à {selectedTime} · {participants} {participants === 1 ? "participant" : "participants"} · {meal === "WITH_MEAL" ? "avec repas" : "sans repas"}</p>
          <p>Total estimé : {total} € · paiement sur place.</p>
        </div>
        <fieldset disabled={step !== 2 || sending || Boolean(success)} className="mt-5 grid gap-4 text-sm text-emerald-900 sm:grid-cols-2">
          <legend className="sr-only">Vos coordonnées</legend>
          <label className="block">Prénom<input name="firstName" autoComplete="given-name" maxLength={60} required className={field} /></label>
          <label className="block">Nom<input name="lastName" autoComplete="family-name" maxLength={60} required className={field} /></label>
          <label className="block">E-mail<input name="email" type="email" autoComplete="email" maxLength={160} required className={field} /></label>
          <label className="block">Téléphone<input name="phone" type="tel" autoComplete="tel" maxLength={30} required className={field} /></label>
          <label className="block sm:col-span-2">Commentaire (facultatif)<textarea name="note" rows={2} maxLength={2000} className={field} /></label>
          <div className="sm:col-span-2"><FormPrivacyNotice purpose="traiter votre demande d’initiation et vous répondre" /></div>
          <p className="leading-6 sm:col-span-2">Cette demande ne vaut pas réservation. Nous vous répondrons par e-mail pour confirmer le créneau.</p>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button type="button" onClick={() => { setStep(1); setError(""); }} className="site-button rounded-full px-5 py-3 font-semibold">Retour</button>
            <button type="submit" disabled={loading || !selectedDate || !selectedTime || Boolean(calendarError)} className="site-button site-button-primary flex-1 rounded-full px-5 py-3 font-semibold disabled:opacity-60">{sending ? "Envoi en cours…" : "Envoyer ma demande"}</button>
          </div>
        </fieldset>
        {error ? <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
        {success ? <p role="status" className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">{success}</p> : null}
      </section>
    </form>
  );
}


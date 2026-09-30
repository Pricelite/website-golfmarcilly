"use client";

import { useRef, useState, type FormEvent } from "react";

import { dailyMenuExample, formatDailyMenuDate, type DailyMenu, type DailyMenuChoice } from "@/data/daily-menu";

type Choices = Pick<DailyMenu, "starters" | "mains" | "desserts">;
const groups = [
  { key: "starters", title: "Entrées" },
  { key: "mains", title: "Plats" },
  { key: "desserts", title: "Desserts" },
] as const;
const inputClass = "mt-2 w-full rounded-xl border border-emerald-950/20 bg-white px-3 py-2 text-sm text-emerald-950 focus-visible:outline-2 focus-visible:outline-emerald-700";

export function DailyMenuManager({ initialDate, initialMenu, initialError }: { initialDate: string; initialMenu: DailyMenu | null; initialError: boolean }) {
  const [date, setDate] = useState(initialDate);
  const [choices, setChoices] = useState<Choices>(initialMenu ?? dailyMenuExample);
  const [published, setPublished] = useState(Boolean(initialMenu));
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(initialError);
  const [error, setError] = useState(initialError ? "La carte du jour est indisponible. Vérifiez Supabase et la migration, puis rechargez." : "");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const requestNumber = useRef(0);

  async function request(method: "GET" | "PUT" | "DELETE", payload?: unknown, selectedDate = date) {
    const url = method === "GET" ? `/api/admin/daily-menu?date=${encodeURIComponent(selectedDate)}` : "/api/admin/daily-menu";
    const response = await fetch(url, {
      method,
      ...(method === "GET" ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Opération impossible. Réessayez.");
    return data as { menu?: DailyMenu | null; deleted?: boolean };
  }

  async function chooseDate(nextDate: string) {
    setDate(nextDate);
    setError(""); setMessage(""); setConfirmDelete(false);
    const current = ++requestNumber.current;
    if (!nextDate) return;
    setBusy(true);
    try {
      const data = await request("GET", undefined, nextDate);
      if (current !== requestNumber.current) return;
      setChoices(data.menu ?? dailyMenuExample);
      setPublished(Boolean(data.menu));
      setUnavailable(false);
    } catch (cause) {
      if (current !== requestNumber.current) return;
      setUnavailable(true);
      setError(cause instanceof Error ? cause.message : "Chargement impossible. Réessayez.");
    } finally {
      if (current === requestNumber.current) setBusy(false);
    }
  }

  function updateChoice(group: keyof Choices, index: number, field: "name" | "price", value: string) {
    setChoices((current) => {
      const updated = [...current[group]] as [DailyMenuChoice, DailyMenuChoice, DailyMenuChoice];
      updated[index] = { ...current[group][index], [field]: value };
      return { ...current, [group]: updated };
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || unavailable || !date) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const data = await request("PUT", { date, ...choices });
      if (data.menu) setChoices(data.menu);
      setPublished(true);
      setMessage(`Carte du ${formatDailyMenuDate(date)} publiée. Elle est visible sur le site à cette date.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Enregistrement impossible. Réessayez."); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (busy || !published || unavailable) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await request("DELETE", { date });
      setPublished(false);
      setChoices(dailyMenuExample);
      setConfirmDelete(false);
      setMessage("Carte retirée. Le site affiche de nouveau un exemple identifié comme tel.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Suppression impossible. Réessayez."); }
    finally { setBusy(false); }
  }

  return (
    <div className="mt-8 text-emerald-950">
      {message ? <p role="status" className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm">{message}</p> : null}
      {error ? <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      <label className="block max-w-xs text-sm font-semibold">Date de la carte
        <input type="date" className={inputClass} value={date} min="1900-01-01" max="2199-12-31" disabled={busy} onChange={(event) => void chooseDate(event.target.value)} />
      </label>
      <p className="mt-3 text-sm text-emerald-900/75">{published ? "Carte publiée pour cette date. Toute modification enregistrée remplace les choix précédents." : "Exemple prérempli. Modifiez les choix puis publiez pour cette date."}</p>
      <form onSubmit={save} className="mt-6">
        <fieldset disabled={busy || unavailable || !date} className="grid gap-5 md:grid-cols-3 disabled:opacity-60">
          {groups.map(({ key, title }) => (
            <fieldset key={key} className="rounded-2xl border border-emerald-950/15 bg-white p-5">
              <legend className="px-2 font-serif text-xl">{title}</legend>
              {choices[key].map((choice, index) => (
                <div key={`${key}-${index}`} className="mt-4 grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2">
                  <label className="block text-sm">Choix {index + 1}
                    <input className={inputClass} value={choice.name} onChange={(event) => updateChoice(key, index, "name", event.target.value)} required maxLength={120} autoComplete="off" />
                  </label>
                  <label className="block text-sm">Prix {index + 1}
                    <input className={inputClass} value={choice.price} onChange={(event) => updateChoice(key, index, "price", event.target.value)} required maxLength={10} pattern="[0-9]{1,4}(,[0-9]{2})? ?€" title="Exemple : 9 € ou 9,50 €" inputMode="decimal" autoComplete="off" />
                  </label>
                </div>
              ))}
            </fieldset>
          ))}
          <div className="flex flex-wrap gap-3 md:col-span-3">
            <button type="submit" className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2">{busy ? "Enregistrement…" : published ? "Enregistrer la carte" : "Publier la carte"}</button>
            {published ? <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-full border border-red-700/30 px-5 py-3 text-sm font-semibold text-red-800 focus-visible:outline-2 focus-visible:outline-offset-2">Retirer cette carte</button> : null}
          </div>
        </fieldset>
      </form>
      {confirmDelete ? <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
        <p>Retirer la carte du {formatDailyMenuDate(date)} du site ?</p>
        <div className="mt-4 flex gap-3">
          <button type="button" disabled={busy} onClick={() => void remove()} className="rounded-full bg-red-800 px-4 py-2 font-semibold text-white disabled:opacity-50">Confirmer</button>
          <button type="button" disabled={busy} onClick={() => setConfirmDelete(false)} className="rounded-full border border-red-800/30 px-4 py-2">Annuler</button>
        </div>
      </div> : null}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { FormPrivacyNotice } from "@/components/forms/form-privacy-notice";
import { juniorPrograms } from "@/data/teaching";
import { FORM_NETWORK_ERROR, getFormErrorMessage } from "@/lib/api/form-feedback";

type ProgramKey = (typeof juniorPrograms)[number]["key"];
type FormState = "idle" | "loading" | "success" | "error";

const inputClass = "mt-2 w-full rounded-2xl border border-emerald-950/15 bg-stone-50 px-4 py-3 text-emerald-950 outline-none focus:border-emerald-800 focus:bg-white";
const labelClass = "block text-sm font-medium text-emerald-950";

export function SchoolEnquiryForm({ initialProgramKey }: { initialProgramKey: ProgramKey }) {
  const [programKey, setProgramKey] = useState<ProgramKey>(initialProgramKey);
  const [state, setState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");
  const submittingRef = useRef(false);
  const program = juniorPrograms.find((item) => item.key === programKey) ?? juniorPrograms[0];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    const form = event.currentTarget;
    const values = new FormData(form);
    const selected = juniorPrograms.find((item) => item.key === values.get("program"));
    const childAge = Number(values.get("childAge"));
    if (!selected || !Number.isInteger(childAge) || childAge < 4 || childAge > 18) {
      setState("error");
      setFeedback("Vérifiez le groupe et l’âge de l’enfant avant d’envoyer la demande.");
      return;
    }

    submittingRef.current = true;
    setState("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/school-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardianFirstName: values.get("guardianFirstName"),
          guardianLastName: values.get("guardianLastName"),
          email: values.get("email"),
          phone: values.get("phone"),
          childFirstName: values.get("childFirstName"),
          childAge,
          program: selected.key,
          preferredSlot: values.get("preferredSlot"),
          notes: values.get("notes"),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        setState("error");
        setFeedback(getFormErrorMessage(response.status));
        return;
      }
      form.reset();
      setState("success");
      setFeedback(result.message);
    } catch {
      setState("error");
      setFeedback(FORM_NETWORK_ERROR);
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={state === "loading"} className="space-y-5 rounded-[28px] border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="font-serif text-2xl text-emerald-950">Votre demande pour un jeune</h2>
      <p className="text-sm text-emerald-950/70">Les champs marqués d’un astérisque sont obligatoires.</p>

      <fieldset className="space-y-4 border-t border-emerald-950/10 pt-5">
        <legend className="font-semibold text-emerald-950">Le jeune golfeur</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Prénom de l’enfant *
            <input name="childFirstName" type="text" required maxLength={80} autoComplete="off" className={inputClass} />
          </label>
          <label className={labelClass}>Âge de l’enfant *
            <input name="childAge" type="number" required min={4} max={18} step={1} inputMode="numeric" className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Groupe souhaité *
            <select name="program" required value={programKey} onChange={(event) => setProgramKey(event.target.value as ProgramKey)} className={inputClass}>
              {juniorPrograms.map((item) => <option key={item.key} value={item.key}>{item.title}</option>)}
            </select>
          </label>
          <label className={labelClass}>Créneau préféré
            <select key={programKey} name="preferredSlot" defaultValue="" className={inputClass}>
              <option value="">À définir avec l’accueil</option>
              {program.slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-emerald-950/10 pt-5">
        <legend className="font-semibold text-emerald-950">Parent ou responsable légal</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Prénom *
            <input name="guardianFirstName" type="text" required maxLength={80} autoComplete="given-name" className={inputClass} />
          </label>
          <label className={labelClass}>Nom *
            <input name="guardianLastName" type="text" required maxLength={80} autoComplete="family-name" className={inputClass} />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>Adresse email *
            <input name="email" type="email" required maxLength={160} autoComplete="email" className={inputClass} />
          </label>
          <label className={labelClass}>Téléphone
            <input name="phone" type="tel" maxLength={30} autoComplete="tel" className={inputClass} />
          </label>
        </div>
      </fieldset>

      <label className={labelClass}>Précisions utiles (facultatif)
        <textarea name="notes" maxLength={2000} rows={4} placeholder="Expérience du golf, questions ou disponibilités..." className={inputClass} />
      </label>
      <FormPrivacyNotice purpose="traiter votre demande concernant l’école de golf et vous répondre" />
      <button type="submit" disabled={state === "loading"} className="site-button site-button-primary rounded-full px-6 py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-60">
        {state === "loading" ? "Envoi en cours..." : "Envoyer ma demande au golf"}
      </button>
      {state === "success" ? <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback}</p> : null}
      {state === "error" ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{feedback}</p> : null}
    </form>
  );
}

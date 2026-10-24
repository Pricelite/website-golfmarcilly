import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ConditionsEditor } from "@/components/backoffice/conditions-editor";
import { currentActor } from "@/lib/backoffice/auth";
import { openDb } from "@/lib/backoffice/db";
import { listConditionStates, listSiteConditions } from "@/lib/site-conditions-store";

export const metadata: Metadata = { title: "Conditions du site — Back-office", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ConditionsPage() {
  const db = openDb();
  try {
    const actor = await currentActor(db);
    if (!actor) redirect("/admin/contenu/connexion");
    if (actor.role !== "admin") notFound();
  } finally { db.close(); }
  let conditions;
  let states;
  try { [conditions, states] = await Promise.all([listSiteConditions(), listConditionStates()]); }
  catch { return <section className="mx-auto max-w-5xl px-4 py-12"><h1 className="font-serif text-3xl">Conditions du site</h1><p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">Les conditions sont indisponibles. Vérifiez la configuration et la migration.</p></section>; }
  return <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
    <Link href="/admin/contenu" className="text-sm underline">← Back-office</Link>
    <h1 className="mt-5 font-serif text-4xl">Conditions du site</h1>
    <ConditionsEditor initialConditions={conditions} initialStates={states} localMode={process.env.NODE_ENV === "development"} />
  </section>;
}

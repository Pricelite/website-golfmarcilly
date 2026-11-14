import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ChangeStaffPasswordForm } from "@/components/admin/change-staff-password-form";
import { currentStaffActor } from "@/lib/admin-access";

export const metadata: Metadata = { title: "Mon compte — Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function MyAccountPage() {
  const actor = await currentStaffActor();
  if (!actor) redirect("/admin/restaurant/connexion");
  return <section className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-sm">
    <h1 className="font-serif text-3xl">Mon compte</h1>
    <p className="mt-2 text-sm text-emerald-950/75">Identifiant : {actor.username ?? actor.email}</p>
    <ChangeStaffPasswordForm />
  </section>;
}

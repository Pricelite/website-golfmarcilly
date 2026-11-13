import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentRestaurantActor } from "@/lib/restaurant-admin/store";

export const metadata: Metadata = { title: "Connexion — Restaurant", robots: { index: false, follow: false }, referrer: "no-referrer" };
export const dynamic = "force-dynamic";

export default async function RestaurantLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; activated?: string }> }) {
  if (await currentRestaurantActor()) redirect("/admin/restaurant");
  const params = await searchParams;
  const error = params.error === "rate" ? "Trop de tentatives. Réessayez dans quelques minutes." :
    params.error === "unavailable" ? "Connexion momentanément indisponible." :
    params.error === "origin" ? "Origine non autorisée. Rechargez la page." :
    params.error ? "Identifiant ou mot de passe incorrect." : "";
  return <section className="mx-auto max-w-lg px-4 py-14">
    <h1 className="font-serif text-4xl">Administration du restaurant</h1>
    <p className="mt-3 text-sm leading-6">Connectez-vous avec le compte personnel créé pour La Bergerie.</p>
    {params.activated === "1" ? <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm">Compte activé. Vous pouvez vous connecter.</p> : null}
    {error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
    <form action="/api/restaurant-admin/session" method="post" className="mt-6 space-y-4 rounded-2xl bg-white p-6">
      <label className="block text-sm">Identifiant ou adresse e-mail<input name="identifier" type="text" autoComplete="username" required maxLength={254} className="mt-1 w-full rounded-lg border border-emerald-950/20 px-3 py-2" /></label>
      <label className="block text-sm">Mot de passe<input name="password" type="password" autoComplete="current-password" required className="mt-1 w-full rounded-lg border border-emerald-950/20 px-3 py-2" /></label>
      <button type="submit" className="site-button">Se connecter</button>
    </form>
  </section>;
}

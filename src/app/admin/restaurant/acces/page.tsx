import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RestaurantAccessManager } from "@/components/admin/restaurant-access-manager";
import { contentBackofficeAvailable, isSuperAdmin } from "@/lib/admin-access";
import { listRestaurantStaff } from "@/lib/restaurant-admin/store";

export const metadata: Metadata = { title: "Comptes et accès — Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function RestaurantAccessPage() {
  if (!(await isSuperAdmin())) notFound();
  let users = null;
  try { users = await listRestaurantStaff(); } catch { /* Afficher une erreur sans exposer la base. */ }
  return <section className="w-full">
    <h1 className="font-serif text-3xl">Comptes et accès</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6">Créez un compte personnel et choisissez les rubriques accessibles à chaque personne. Elle définira son mot de passe avec un lien d’activation. Vous pourrez modifier ses droits ou supprimer son compte à tout moment.</p>
    {users ? <RestaurantAccessManager initialUsers={users} contentAvailable={contentBackofficeAvailable()} /> : <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">La gestion des accès est momentanément indisponible. Vérifiez la configuration et les migrations Supabase.</p>}
  </section>;
}

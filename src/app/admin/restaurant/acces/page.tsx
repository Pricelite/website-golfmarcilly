import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { RestaurantAccessManager } from "@/components/admin/restaurant-access-manager";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";
import { RESTAURANT_NAME } from "@/lib/restaurant-admin/policy";
import { listRestaurantStaff } from "@/lib/restaurant-admin/store";

export const metadata: Metadata = { title: "Accès au restaurant — Administration", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function RestaurantAccessPage() {
  if (!process.env.ADMIN_PASSWORD?.trim() || !(await isAdminAuthenticated(await cookies()))) notFound();
  let users = null;
  try { users = await listRestaurantStaff(); } catch { /* Afficher une erreur sans exposer la base. */ }
  return <section className="w-full">
    <h1 className="font-serif text-3xl">Accès au restaurant</h1>
    <p className="mt-3 max-w-3xl text-sm leading-6">Invitez une personne à gérer la carte de {RESTAURANT_NAME}. Elle choisira son propre mot de passe. Vous pourrez révoquer son accès à tout moment.</p>
    {users ? <RestaurantAccessManager initialUsers={users} /> : <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">La gestion des accès est momentanément indisponible. Vérifiez la configuration du stockage restaurant.</p>}
  </section>;
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Activer mon accès restaurant", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function RestaurantActivatePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <section className="mx-auto max-w-lg px-4 py-14">
    <h1 className="font-serif text-4xl">Activer mon accès restaurant</h1>
    <p className="mt-3 text-sm leading-6">Choisissez un mot de passe personnel d’au moins 14 caractères. Le lien expire après 24 heures et ne peut servir qu’une fois.</p>
    <form action="/api/restaurant-admin/activate" method="post" className="mt-6 space-y-4 rounded-2xl bg-white p-6">
      <input type="hidden" name="token" value={token ?? ""} />
      <label className="block text-sm">Nouveau mot de passe<input name="password" type="password" autoComplete="new-password" required minLength={14} maxLength={256} className="mt-1 w-full rounded-lg border border-emerald-950/20 px-3 py-2" /></label>
      <button type="submit" className="site-button">Activer mon compte</button>
    </form>
  </section>;
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/backoffice/login-form";

export const metadata: Metadata = { title: "Connexion — Administration du contenu", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; password?: string }> }) {
  const params = await searchParams;
  if (params.password !== undefined) redirect("/admin/contenu/connexion?error=unsafe_url");
  return <section className="mx-auto max-w-lg px-4 py-16 sm:px-6">
    <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-700">Administration</p>
    <h1 className="mt-3 font-serif text-4xl text-emerald-950">Connexion personnelle</h1>
    <p className="mt-4 text-sm leading-6 text-emerald-900/75">Saisissez votre adresse et votre mot de passe pour gérer les contenus autorisés.</p>
    <LoginForm error={params.error} />
  </section>;
}

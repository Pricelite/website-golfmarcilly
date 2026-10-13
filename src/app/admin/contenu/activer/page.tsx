import type { Metadata } from "next";
import { ActivateForm } from "@/components/backoffice/activate-form";

export const metadata: Metadata = { title: "Activer mon compte", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function ActivatePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <section className="mx-auto max-w-lg px-4 py-16"><h1 className="font-serif text-4xl">Activer mon compte</h1><p className="mt-4 text-sm leading-6">Choisissez un mot de passe personnel d’au moins 14 caractères. Le lien ne peut servir qu’une fois.</p><ActivateForm token={token ?? ""} /></section>;
}

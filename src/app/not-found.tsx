import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-emerald-950">
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
            Page introuvable
          </p>
          <h1 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
            Cette page n&apos;existe pas
          </h1>
          <p className="mt-3 text-sm leading-6 text-emerald-900/70">
            Vérifiez l&apos;adresse ou revenez à l&apos;accueil pour continuer
            votre visite.
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              href="/"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

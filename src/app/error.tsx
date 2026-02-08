"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="text-emerald-950">
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
            Erreur
          </p>
          <h1 className="mt-4 font-[var(--font-display)] text-3xl text-emerald-950">
            Une erreur est survenue
          </h1>
          <p className="mt-3 text-sm leading-6 text-emerald-900/70">
            Nous n&apos;avons pas pu afficher cette page. Vous pouvez réessayer
            ou revenir à l&apos;accueil.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              type="button"
              onClick={() => reset()}
            >
              Réessayer
            </button>
            <Link
              className="inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
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

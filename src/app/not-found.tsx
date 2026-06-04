import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
        404
      </p>
      <h1 className="mt-4 font-serif text-5xl text-emerald-950">
        Cette page n&apos;existe pas
      </h1>
      <p className="mt-5 text-base leading-8 text-emerald-950/75">
        Revenez a l&apos;accueil ou explorez les parcours, le restaurant et les
        evenements du Golf de Marcilly.
      </p>
      <Link
        className="mt-8 inline-flex rounded-full bg-emerald-900 px-5 py-3 text-sm font-semibold text-stone-50"
        href="/"
      >
        Retour a l&apos;accueil
      </Link>
    </section>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Informations légales du site du Golf de Marcilly.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 text-emerald-950">
      <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
        <h1 className="font-[var(--font-display)] text-3xl text-emerald-950 md:text-4xl">
          Mentions légales
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-emerald-900/80">
          <p>
            Éditeur du site: Golf de Marcilly, 829 domaine de la Plaine, 45240
            Marcilly-en-Villette.
          </p>
          <p>Contact: golf@marcilly.com - 02 38 76 11 73.</p>
          <p>
            Directeur de la publication: Direction du Golf de Marcilly.
          </p>
          <p>
            Hébergement: Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
            USA.
          </p>
        </div>
      </section>
    </main>
  );
}

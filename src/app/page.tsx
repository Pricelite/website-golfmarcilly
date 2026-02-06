export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(1200px_circle_at_10%_-10%,#d9f2d1_0%,transparent_55%),radial-gradient(900px_circle_at_90%_10%,#f8edd2_0%,transparent_50%),linear-gradient(135deg,#f6f5ee_0%,#f3f8f1_45%,#eef6ed_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-20 top-32 h-56 w-56 rounded-full bg-emerald-200/40 blur-3xl motion-safe:animate-[soft-float_14s_ease-in-out_infinite]" />
        <div className="absolute right-0 top-16 h-72 w-72 rounded-full bg-lime-200/40 blur-3xl motion-safe:animate-[soft-float_18s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl motion-safe:animate-[soft-float_16s_ease-in-out_infinite]" />
      </div>

      <header className="relative z-10 border-b border-emerald-900/10 bg-white/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-900 text-emerald-100">
              <span className="font-[var(--font-display)] text-lg">GM</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-800">
                Golf Marcilly
              </p>
              <p className="font-[var(--font-display)] text-lg text-emerald-950">
                Club & Parcours
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-900/15 bg-white/80 text-emerald-900 shadow-sm">
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3l2.6 5.4L20 9l-4 3.9.9 5.6L12 16l-4.9 2.5.9-5.6L4 9l5.4-.6L12 3z" />
                <path d="M7.5 20.5l-2-1.3m13 1.3l-2-1.3" />
              </svg>
              <span className="sr-only">Association sportive</span>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-emerald-900/80 md:flex">
            <a className="transition hover:text-emerald-700" href="#experience">
              Le parcours
            </a>
            <a className="transition hover:text-emerald-700" href="#academy">
              Academie
            </a>
            <a className="transition hover:text-emerald-700" href="#events">
              Tournois
            </a>
            <a className="transition hover:text-emerald-700" href="#contact">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden rounded-full border border-emerald-900/20 px-4 py-2 text-sm font-semibold text-emerald-900 transition hover:border-emerald-900/40 hover:bg-white/70 md:inline-flex">
              Tarifs
            </button>
            <button className="rounded-full bg-emerald-900 px-5 py-2 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800">
              Reserver un depart
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-16 md:grid-cols-[1.15fr_0.85fr] md:items-center md:pt-24">
          <div className="space-y-8 motion-safe:animate-[fade-up_0.9s_ease-out_both]">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
              Un domaine pense pour le jeu et la detente
            </p>
            <h1 className="font-[var(--font-display)] text-4xl leading-tight text-emerald-950 md:text-6xl">
              Une experience golfique immersive au coeur de la nature.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-emerald-900/70">
              Fairways vallonnes, practice premium et maison du club elegante.
              Decouvrez un lieu ou chaque depart raconte une histoire.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button className="rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/25 transition hover:-translate-y-0.5 hover:bg-emerald-800">
                Visiter le parcours
              </button>
              <button className="rounded-full border border-emerald-900/20 bg-white/60 px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-900/40 hover:bg-white">
                Decouvrir l&apos;academie
              </button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-emerald-900/70">
              <div>
                <p className="text-2xl font-semibold text-emerald-950">18</p>
                <p>trous sculptes</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-emerald-950">35 ha</p>
                <p>de greens &amp; foret</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-emerald-950">7j/7</p>
                <p>departs encadres</p>
              </div>
            </div>
          </div>

          <div className="relative motion-safe:animate-[fade-up_0.9s_ease-out_both] motion-safe:[animation-delay:120ms]">
            <div className="rounded-[32px] border border-emerald-900/10 bg-white/70 p-6 shadow-2xl shadow-emerald-900/15 backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">
                    Conditions du jour
                  </p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                    Ouvert
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-[var(--font-display)] text-2xl text-emerald-950">
                    Parcours &amp; Clubhouse
                  </p>
                  <p className="text-sm text-emerald-900/70">
                    Departs disponibles des 8h30, practice eclaire jusqu&apos;a
                    21h00.
                  </p>
                </div>
                <div className="grid gap-3 rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                  <div className="flex items-center justify-between">
                    <span>Green fee</span>
                    <span className="font-semibold">48 EUR</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Practice illimite</span>
                    <span className="font-semibold">12 EUR</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Parcours accompagne</span>
                    <span className="font-semibold">72 EUR</span>
                  </div>
                </div>
                <button className="w-full rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800">
                  Voir les disponibilites
                </button>
              </div>
            </div>
            <div className="absolute -right-6 -top-6 hidden rounded-full border border-emerald-900/15 bg-white/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 shadow-lg shadow-emerald-900/10 md:block">
              + Club house
            </div>
          </div>
        </section>

        <section
          id="experience"
          className="mx-auto w-full max-w-6xl px-6 pb-20"
        >
          <div className="rounded-[32px] border border-emerald-900/10 bg-white/70 p-10 text-center shadow-xl shadow-emerald-900/10 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
              Experience
            </p>
            <h2 className="mt-4 font-[var(--font-display)] text-4xl text-emerald-950 md:text-5xl">
              Golf de Marcilly-Orleans
            </h2>
          </div>
        </section>

        <section id="academy" className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="grid gap-8 rounded-[32px] border border-emerald-900/10 bg-white/70 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
                Academie & coaching
              </p>
              <h2 className="font-[var(--font-display)] text-3xl text-emerald-950">
                Des sessions sur mesure pour progresser vite.
              </h2>
              <p className="text-sm leading-7 text-emerald-900/70">
                Seances individuelles, clinics collectifs et fitting complet
                encadres par nos pros.
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50/70 p-6 text-sm text-emerald-900">
              <div className="flex items-center justify-between">
                <span>1h coaching prive</span>
                <span className="font-semibold">55 EUR</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Stage weekend</span>
                <span className="font-semibold">140 EUR</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Analyse swing</span>
                <span className="font-semibold">35 EUR</span>
              </div>
              <button className="mt-6 w-full rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-800">
                Planifier un cours
              </button>
            </div>
          </div>
        </section>

        <section
          id="events"
          className="mx-auto w-full max-w-6xl px-6 pb-24"
        >
          <div className="grid gap-8 rounded-[32px] border border-emerald-900/10 bg-emerald-950 px-8 py-10 text-emerald-50 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">
                Tournois &amp; evenements
              </p>
              <h2 className="font-[var(--font-display)] text-3xl md:text-4xl">
                Une saison rythmee par des competitions signature.
              </h2>
              <p className="text-sm leading-7 text-emerald-100/80">
                Challenges mensuels, afterworks au practice et competitions
                ouvertes aux visiteurs.
              </p>
            </div>
            <div className="rounded-3xl bg-emerald-900/60 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">
                Prochain evenement
              </p>
              <p className="mt-3 text-2xl font-semibold">Coupe du Marais</p>
              <p className="mt-2 text-sm text-emerald-100/80">
                Samedi 22 mars - shotgun 9h00
              </p>
              <button className="mt-6 w-full rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-white">
                S&apos;inscrire
              </button>
            </div>
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto w-full max-w-6xl px-6 pb-24"
        >
          <div className="grid gap-6 rounded-[32px] border border-emerald-900/10 bg-white/70 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <h2 className="font-[var(--font-display)] text-3xl text-emerald-950">
                Planifier une visite
              </h2>
              <p className="text-sm leading-7 text-emerald-900/70">
                Notre equipe repond rapidement pour vos departs, evenements
                prives ou seminaires.
              </p>
              <div className="grid gap-3 text-sm text-emerald-900">
                <div>Accueil: 03 00 00 00 00</div>
                <div>contact@golfmarcilly.fr</div>
                <div>Route des Etangs, 41200 Marcilly</div>
              </div>
            </div>
            <div className="rounded-3xl border border-emerald-900/10 bg-emerald-50/70 p-6 text-sm text-emerald-900">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">
                Horaires
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span>Lun - Ven</span>
                  <span className="font-semibold">8h30 - 19h00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sam - Dim</span>
                  <span className="font-semibold">8h00 - 20h00</span>
                </div>
              </div>
              <button className="mt-6 w-full rounded-2xl border border-emerald-900/20 bg-white px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-900/40">
                Nous ecrire
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}



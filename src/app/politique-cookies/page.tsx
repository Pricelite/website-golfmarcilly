import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique cookies",
  description: "Informations sur les cookies utilisés par le site.",
};

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 text-emerald-950">
      <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
        <h1 className="font-[var(--font-display)] text-3xl text-emerald-950 md:text-4xl">
          Politique cookies
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-emerald-900/80">
          <p>
            Le site utilise des cookies techniques nécessaires au fonctionnement
            et, avec votre accord, un cookie de mesure d&apos;audience (GA4).
          </p>
          <p>
            Les cookies d&apos;audience sont déposés uniquement si vous cliquez
            sur
            {" "}
            <strong>Accepter</strong>
            {" "}
            dans la bannière de consentement.
          </p>
          <p>
            Vous pouvez modifier votre choix à tout moment en supprimant les
            données locales de votre navigateur puis en rechargeant la page.
          </p>
        </div>
      </section>
    </main>
  );
}

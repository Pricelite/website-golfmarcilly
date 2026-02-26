import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Gestion des données personnelles collectées par le site du Golf de Marcilly.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 text-emerald-950">
      <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
        <h1 className="font-[var(--font-display)] text-3xl text-emerald-950 md:text-4xl">
          Politique de confidentialité
        </h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-emerald-900/80">
          <p>
            Les données transmises via les formulaires (nom, prénom, téléphone,
            e-mail, message) sont utilisées uniquement pour traiter votre
            demande.
          </p>
          <p>
            Base légale: intérêt légitime à répondre aux demandes entrantes et
            relation commerciale précontractuelle.
          </p>
          <p>
            Durée de conservation: le temps nécessaire au traitement de la
            demande et au suivi opérationnel.
          </p>
          <p>
            Vous pouvez exercer vos droits d&apos;accès, de rectification,
            d&apos;effacement et d&apos;opposition en écrivant à
            {" "}
            golf@marcilly.com.
          </p>
        </div>
      </section>
    </main>
  );
}

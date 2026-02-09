import type { Metadata } from "next";

import ContactForm from "@/app/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez le Golf de Marcilly via le formulaire, par telephone ou par email.",
};

export default function Page() {
  return (
    <div className="text-emerald-950">
      <main className="mx-auto w-full max-w-6xl px-6 py-8 md:py-10">
        <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <h2 className="font-[var(--font-display)] text-2xl text-emerald-950">
            Envoyer un message
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/70">
            Vous pouvez egalement nous joindre par telephone ou par email.
          </p>

          <ContactForm />
        </section>
      </main>
    </div>
  );
}

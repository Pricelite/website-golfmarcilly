import { ContactForm } from "@/components/forms/contact-form";
import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { MapEmbed } from "@/components/ui/map-embed";
import { SectionTitle } from "@/components/ui/section-title";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Adresse, telephone, email, horaires, acces et formulaire de contact du Golf de Marcilly.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-emerald-950 text-stone-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(133,188,143,0.24),transparent_30%),linear-gradient(135deg,rgba(6,24,20,0.96),rgba(10,44,35,0.88))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-200/80">
              Contact
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] text-stone-50 sm:text-6xl">
              Contactez le Golf de Marcilly
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href={`tel:${siteConfig.phoneHref}`} variant="secondary">
                Appeler le golf
              </CTAButton>
              <CTAButton href={`mailto:${siteConfig.email}`} variant="secondary">
                Envoyer un email
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-[30px] border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Telephone
            </p>
            <a
              className="mt-4 block font-serif text-2xl text-emerald-950"
              href={`tel:${siteConfig.phoneHref}`}
            >
              {siteConfig.phoneDisplay}
            </a>
          </article>

          <article className="rounded-[30px] border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Email
            </p>
            <a
              className="mt-4 block font-serif text-2xl text-emerald-950"
              href={`mailto:${siteConfig.email}`}
            >
              {siteConfig.email}
            </a>
          </article>

          <article className="rounded-[30px] border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Adresse
            </p>
            <p className="mt-4 font-serif text-2xl text-emerald-950">{siteConfig.city}</p>
            <p className="mt-3 text-sm leading-7 text-emerald-950/72">
              {siteConfig.addressLine1}
              <br />
              {siteConfig.addressLine2}
            </p>
          </article>

          <article className="rounded-[30px] border border-emerald-950/10 bg-white/90 p-6 shadow-sm shadow-emerald-950/5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Horaires
            </p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-emerald-950/72">
              {siteConfig.hours.map((item) => (
                <li key={item.label}>
                  <span className="font-medium text-emerald-950">{item.label} :</span>{" "}
                  {item.value}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <SectionTitle eyebrow="Formulaire" title="Envoyez votre demande" />
          </div>

          <div id="reservation">
            <ContactForm />
          </div>
        </div>

        <div className="mt-16">
          <SectionTitle eyebrow="Carte" title="Acces et Google Maps" />
          <div className="mt-8">
            <MapEmbed src={siteConfig.mapEmbedUrl} title="Google Maps Golf de Marcilly" />
          </div>
        </div>
      </section>
    </>
  );
}

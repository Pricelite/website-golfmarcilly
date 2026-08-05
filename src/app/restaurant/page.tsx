import { ContactForm } from "@/components/forms/contact-form";
import { RestaurantDishesCarousel } from "@/components/restaurant-dishes-carousel";
import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import {
  restaurantGallery,
  restaurantHighlights,
  restaurantMenus,
} from "@/data/restaurant";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Restaurant La Bergerie",
  description:
    "Restaurant golf Orléans : présentation, carte, menus, groupes, séminaires, privatisation et réservation pour La Bergerie au Golf de Marcilly.",
  path: "/restaurant",
  image: "/restaurant/hero.jpg",
});

export default function RestaurantPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Restaurant", path: "/restaurant" },
        ])}
      />

      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-emerald-950 text-stone-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(184,208,154,0.22),transparent_28%),linear-gradient(140deg,rgba(6,24,20,0.96),rgba(15,46,38,0.9))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-200/80">
              Restaurant golf Orléans
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl">
              Restaurant La Bergerie
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-50/80">
              Une adresse de domaine chaleureuse pour déjeuner, recevoir, organiser
              un repas de groupe ou renforcer la crédibilité d&apos;un événement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href="/contact#reservation" variant="secondary">
                Réserver une table
              </CTAButton>
              <CTAButton href="tel:+33238761173" variant="secondary">
                Appeler le restaurant
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="La Bergerie"
          title="Une table de domaine pensée pour le plaisir"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {restaurantHighlights.map((item) => (
            <article
              className="rounded-[32px] border border-emerald-950/10 bg-white/92 p-8 shadow-xl shadow-emerald-950/8"
              key={item.title}
            >
              <h3 className="font-serif text-2xl text-emerald-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-950/76">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16">
          <SectionTitle
            eyebrow="Carte & menus"
            title="Des formats pensés pour la table, les groupes et les séminaires"
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {restaurantMenus.map((menu) => (
              <article
                className="rounded-[30px] border border-emerald-950/10 bg-white/92 p-7 shadow-xl shadow-emerald-950/8"
                key={menu.title}
              >
                <h3 className="font-serif text-2xl text-emerald-950">{menu.title}</h3>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-emerald-950/75">
                  {menu.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-5 text-sm font-semibold text-emerald-700">
                  {menu.price}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionTitle eyebrow="Galerie" title="Un carrousel de plats et d'ambiances" />
            <div className="mt-8">
              <RestaurantDishesCarousel items={restaurantGallery} />
            </div>
          </div>
          <div>
            <SectionTitle
              eyebrow="Réservation"
              title="Parlez-nous de votre table, de votre groupe ou de votre privatisation"
            />
            <div className="mt-8">
              <ContactForm
                context="restaurant"
                subjectPlaceholder="Réservation de table, groupe, privatisation..."
                submitLabel="Envoyer ma demande restaurant"
                successMessage="Votre demande restaurant a bien été reçue par le site."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

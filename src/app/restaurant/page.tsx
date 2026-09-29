import { ContactForm } from "@/components/forms/contact-form";
import RestaurantReservationModal from "@/components/restaurant-reservation-modal";
import { RestaurantDishesCarousel } from "@/components/restaurant-dishes-carousel";
import { RestaurantMenus } from "@/components/sections/restaurant-menus";
import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import {
  restaurantGallery,
} from "@/data/restaurant";
import { buildMetadata } from "@/lib/metadata";
import { restaurantData } from "@/lib/restaurant-data";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Restaurant La Bergerie",
  description:
    "Restaurant golf de Marcilly-Orléans : présentation, carte, menus, groupes, séminaires, privatisation et réservation pour La Bergerie au Golf de Marcilly.",
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
              Restaurant golf de Marcilly-Orléans
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl">
              Restaurant La Bergerie
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-50/80">
              Retrouvez-vous à La Bergerie pour déjeuner après une partie,
              partager un repas de groupe ou organiser une réception.
              Le restaurant accueille aussi les visiteurs qui ne jouent pas au golf.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href="#menus" variant="secondary">Découvrir les menus</CTAButton>
              <RestaurantReservationModal triggerClassName="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2" />
              <CTAButton href="tel:+33238761173" variant="secondary">
                Appeler le restaurant
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <section id="horaires-restaurant" aria-labelledby="horaires-restaurant-title" className="mb-12 scroll-mt-28 overflow-hidden rounded-2xl border border-emerald-950/15 bg-[#f7f4e9] lg:grid lg:grid-cols-[0.8fr_1.2fr]">
          <div className="bg-emerald-950 p-6 text-stone-50 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-100/80">Votre déjeuner à La Bergerie</p>
            <h2 id="horaires-restaurant-title" className="mt-3 font-serif text-3xl">Horaires d’ouverture</h2>
            <p className="mt-4 text-sm leading-7 text-stone-100/85">Le restaurant vous accueille pour le service du midi, sauf le mardi. Le bar est ouvert tous les jours.</p>
          </div>
          <dl className="divide-y divide-emerald-950/15 px-6 py-2 sm:px-8">
            {restaurantData.hours.map(day => (
              <div key={day.label} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3 py-3 text-sm leading-6 text-emerald-950 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6">
                <dt className="font-semibold">{day.label}</dt>
                <dd className="space-y-1">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                    <span>Restaurant</span>
                    <span className="whitespace-nowrap font-semibold">{day.hours}</span>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-emerald-800">
                    <span>Bar</span>
                    <span className="whitespace-nowrap font-semibold">{day.barHours}</span>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <SectionTitle eyebrow="La Bergerie" title="Votre réception, à votre image" />
            <div className="mt-5 space-y-4 text-base leading-8 text-emerald-950/80">
              {restaurantData.intro.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <div className="mt-6 border-l-2 border-emerald-700 bg-[#f7f4e9] px-5 py-4">
              <h3 className="font-serif text-xl text-emerald-950">Location de salle seule</h3>
              <p className="mt-2 text-sm font-semibold leading-7 text-emerald-950">{restaurantData.intro.roomRental}</p>
              <p className="mt-1 text-sm leading-7 text-emerald-950/75">{restaurantData.intro.roomRentalNote}</p>
            </div>
          </div>
          <div className="divide-y divide-emerald-950/15 rounded-2xl border border-emerald-950/10 bg-[#f7f4e9] px-6 sm:px-8">
            {restaurantData.services.map(service => (
              <article key={service.title} className="py-6">
                <h3 className="font-serif text-2xl text-emerald-950">{service.title}</h3>
                {service.description ? <p className="mt-3 text-sm leading-7 text-emerald-950/80">{service.description}</p> : null}
              </article>
            ))}
          </div>
        </div>

        <RestaurantMenus />

        <section id="conditions-restaurant" className="mt-12 scroll-mt-28 border-y border-emerald-950/15 py-10">
          <SectionTitle eyebrow="Préparer votre réception" title={restaurantData.cgv.title} />
          <div className="mt-7 grid gap-8 lg:grid-cols-3">
            {restaurantData.cgv.sections.map(section => (
              <div key={section.title}>
                <h3 className="font-serif text-xl text-emerald-950">{section.title}</h3>
                <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-emerald-950/80">
                  {section.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-8 font-serif text-xl text-emerald-900">{restaurantData.cgv.closingNote}</p>
        </section>

        <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionTitle eyebrow="Galerie" title="Découvrez le restaurant en images" />
            <div className="mt-8">
              <RestaurantDishesCarousel items={restaurantGallery} />
            </div>
          </div>
          <div id="devis-restaurant" className="scroll-mt-28">
            <SectionTitle
              eyebrow="Groupes & privatisation"
              title="Votre demande de devis global"
              description="Précisez la date, le nombre de personnes, le menu et le forfait boissons souhaités. Ajoutez vos besoins pour la salle ou le séminaire, le cas échéant."
            />
            <div className="mt-8">
              <ContactForm
                context="restaurant"
                subjectPlaceholder="Devis global : repas, boissons, réception..."
                messagePlaceholder="Date souhaitée, nombre de personnes, menu choisi, forfait boissons et besoins complémentaires..."
                submitLabel="Envoyer ma demande de devis global"
                successMessage="Votre demande restaurant a bien été reçue par le site."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

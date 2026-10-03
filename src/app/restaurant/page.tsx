import Image from "next/image";

import { ContactForm } from "@/components/forms/contact-form";
import { RestaurantDishesCarousel } from "@/components/restaurant-dishes-carousel";
import { RestaurantLiveClock } from "@/components/restaurant-live-clock";
import RestaurantReservationModal from "@/components/restaurant-reservation-modal";
import { DailyMenuSection } from "@/components/sections/daily-menu";
import { RestaurantMenus } from "@/components/sections/restaurant-menus";
import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { restaurantGallery } from "@/data/restaurant";
import { buildMetadata } from "@/lib/metadata";
import { restaurantData } from "@/lib/restaurant-data";
import { buildBreadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Restaurant La Bergerie",
  description: "Restaurant golf de Marcilly-Orléans : carte du jour, menus, groupes, séminaires, privatisation et réservation pour La Bergerie au Golf de Marcilly.",
  path: "/restaurant",
  image: "/restaurant/hero.jpg",
});

export const revalidate = 30;

const pageLinks = [
  { href: "#carte-du-jour", label: "Carte du jour" },
  { href: "#horaires-restaurant", label: "Horaires" },
  { href: "#menus", label: "Menus de groupes" },
  { href: "#menu-seminaire", label: "Séminaires" },
  { href: "#devis-restaurant", label: "Demander un devis" },
] as const;

export default function RestaurantPage() {
  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([{ name: "Accueil", path: "/" }, { name: "Restaurant", path: "/restaurant" }])} />

      <section className="relative isolate overflow-hidden bg-emerald-950 text-stone-50">
        <Image src="/restaurant/hero.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,31,24,0.96)_0%,rgba(3,31,24,0.88)_48%,rgba(3,31,24,0.52)_100%)]" />
        <div className="mx-auto grid min-h-[42rem] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.75fr)] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#dbe9b4]">Restaurant du Golf de Marcilly-Orléans</p>
            <h1 className="mt-6 font-serif text-5xl leading-[0.94] sm:text-6xl lg:text-7xl">
              La Bergerie,
              <span className="mt-2 block italic text-[#dbe9b4]">une table au cœur du golf.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-stone-100/90 sm:text-lg">Une cuisine simple et gourmande, un cadre paisible et le plaisir de se retrouver à table après une partie ou simplement pour déjeuner.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <RestaurantReservationModal triggerClassName="inline-flex items-center justify-center rounded-full bg-stone-50 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-black/10 transition hover:bg-[#dbe9b4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-50 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-950" />
              <CTAButton href="#menus" variant="secondary">Découvrir les menus</CTAButton>
              <CTAButton href="tel:+33238761173" variant="secondary">02 38 76 11 73</CTAButton>
            </div>
          </div>
          <DailyMenuSection />
        </div>
      </section>

      <nav aria-label="Découvrir le restaurant" className="border-b border-emerald-950/10 bg-[#f7f4e9]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
          {pageLinks.map((link) => (
            <a key={link.href} href={link.href} className="shrink-0 rounded-full border border-emerald-950/15 bg-white/60 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:border-emerald-800 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">{link.label}</a>
          ))}
        </div>
      </nav>

      <div>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-8">
          <div className="relative min-h-[28rem] overflow-hidden rounded-[32px] sm:min-h-[36rem]">
            <Image src="/images/bar-la-bergerie-seminaire.jpeg" alt="Le bar et la salle du restaurant La Bergerie" fill sizes="(max-width: 1024px) calc(100vw - 32px), 530px" className="object-cover" />
            <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-emerald-950/90 p-5 text-stone-50 backdrop-blur-sm sm:inset-x-7 sm:bottom-7 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#dbe9b4]">La Bergerie au quotidien</p>
              <p className="mt-2 font-serif text-2xl">Un lieu chaleureux pour déjeuner et se retrouver.</p>
            </div>
          </div>

          <div>
            <SectionTitle eyebrow="Une pause gourmande" title="Déjeuner au vert, même sans jouer au golf" description="La Bergerie accueille les golfeurs, les visiteurs et les groupes dans un cadre ouvert sur le domaine de Marcilly." />
            <div className="mt-7 space-y-4 text-base leading-8 text-emerald-950/80">
              {restaurantData.intro.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <div className="mt-9 grid gap-5 sm:grid-cols-3">
              {restaurantData.services.map((service, index) => (
                <article key={service.title} className="border-t border-emerald-950/20 pt-4">
                  <span aria-hidden="true" className="font-serif text-2xl text-emerald-700">0{index + 1}</span>
                  <h3 className="mt-3 font-serif text-xl text-emerald-950">{service.title}</h3>
                  {service.description ? <p className="mt-2 text-sm leading-6 text-emerald-950/70">{service.description}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="horaires-restaurant" aria-labelledby="horaires-restaurant-title" className="scroll-mt-28 bg-emerald-950 py-16 text-stone-50 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-stretch lg:gap-0 lg:px-8">
            <div className="flex flex-col rounded-t-[28px] bg-[#123f35] p-7 sm:p-9 lg:rounded-l-[28px] lg:rounded-tr-none">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dbe9b4]">Informations pratiques</p>
              <h2 id="horaires-restaurant-title" className="mt-4 font-serif text-4xl">Horaires d’ouverture</h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-stone-100/80">Le restaurant vous accueille pour le service du midi, sauf le mardi. Le bar reste ouvert tous les jours.</p>
              <RestaurantLiveClock />
            </div>
            <div className="rounded-b-[28px] bg-[#f7f4e9] px-6 py-3 text-emerald-950 sm:px-9 lg:rounded-r-[28px] lg:rounded-bl-none">
              <dl className="divide-y divide-emerald-950/15">
                {restaurantData.hours.map((day) => (
                  <div key={day.label} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-4 py-4 text-sm leading-6 sm:grid-cols-[8rem_minmax(0,1fr)]">
                    <dt className="font-semibold">{day.label}</dt>
                    <dd className="grid gap-1 sm:grid-cols-2 sm:gap-5">
                      <div className="flex justify-between gap-3"><span className="text-emerald-950/65">Restaurant</span><span className="whitespace-nowrap font-semibold">{day.hours}</span></div>
                      <div className="flex justify-between gap-3 text-emerald-800"><span className="text-emerald-950/65">Bar</span><span className="whitespace-nowrap font-semibold">{day.barHours}</span></div>
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="border-t border-emerald-950/15 py-6">
                <p className="text-sm font-semibold">Restaurant ouvert aux golfeurs et aux visiteurs extérieurs.</p>
                <div className="mt-4"><RestaurantReservationModal /></div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"><RestaurantMenus /></div>

        <section className="bg-[#f7f4e9] py-16 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:px-8">
            <div>
              <SectionTitle eyebrow="La Bergerie en images" title="La cuisine, la salle et le cadre" description="Découvrez l’atmosphère du restaurant et quelques instants de préparation en cuisine." />
              <div className="mt-8"><RestaurantDishesCarousel items={restaurantGallery} /></div>
            </div>
            <div id="devis-restaurant" className="scroll-mt-28 rounded-[28px] border border-emerald-950/10 bg-white p-6 shadow-sm sm:p-8">
              <SectionTitle eyebrow="Groupes & privatisation" title="Construisons votre réception" description="Précisez la date, le nombre de personnes, le menu et les boissons souhaitées. Ajoutez vos besoins pour la salle ou le séminaire." />
              <div className="mt-8">
                <ContactForm context="restaurant" subjectPlaceholder="Devis : repas, boissons, réception..." messagePlaceholder="Date souhaitée, nombre de personnes, menu choisi, boissons souhaitées et besoins complémentaires..." submitLabel="Envoyer ma demande de devis" successMessage="Votre demande restaurant a bien été reçue par le site." />
              </div>
            </div>
          </div>
        </section>

        <section id="conditions-restaurant" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <SectionTitle eyebrow="Préparer votre réception" title={restaurantData.cgv.title} />
              <p className="mt-5 text-sm leading-7 text-emerald-950/70">Les informations essentielles pour organiser votre repas, votre réception ou votre location de salle à La Bergerie.</p>
              <div className="mt-6 rounded-2xl border-l-4 border-emerald-700 bg-[#f7f4e9] p-5">
                <h3 className="font-serif text-xl text-emerald-950">Location de salle seule</h3>
                <p className="mt-2 text-sm font-semibold leading-7 text-emerald-950">{restaurantData.intro.roomRental}</p>
                <p className="mt-1 text-sm leading-7 text-emerald-950/70">{restaurantData.intro.roomRentalNote}</p>
              </div>
            </div>
            <div className="divide-y divide-emerald-950/15 border-y border-emerald-950/15">
              {restaurantData.cgv.sections.map((section) => (
                <article key={section.title} className="grid gap-4 py-7 sm:grid-cols-[11rem_1fr] sm:gap-8">
                  <h3 className="font-serif text-xl text-emerald-950">{section.title}</h3>
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-emerald-950/75">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
          <p className="mt-10 text-center font-serif text-xl italic text-emerald-900">{restaurantData.cgv.closingNote}</p>
        </section>
      </div>
    </>
  );
}

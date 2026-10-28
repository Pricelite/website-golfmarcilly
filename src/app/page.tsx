import Image from "next/image";
import { cookies } from "next/headers";
import { Hero } from "@/components/sections/hero";
import { PromoOffersModal } from "@/components/promo-offers-modal";
import { SponsorMarquee } from "@/components/sections/sponsor-marquee";
import { SiteConditions } from "@/components/sections/site-conditions";
import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { MapEmbed } from "@/components/ui/map-embed";
import { SectionTitle } from "@/components/ui/section-title";
import { teachingPros } from "@/data/teaching";
import { getActiveSiteOffers } from "@/data/offers";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";
import { listSiteConditions } from "@/lib/site-conditions-store";
import { emptyConditions } from "@/data/site-conditions";
import { isAdminAuthenticated } from "@/lib/initiation/admin-auth";

export const metadata = buildMetadata({
  title: "Golf de Marcilly : 45 trous près d’Orléans",
  description:
    "Découvrez les parcours, le restaurant La Bergerie, les cours et les événements du Golf de Marcilly, aux portes d'Orléans.",
  path: "/",
});

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const activeOffers = getActiveSiteOffers();
  let conditions = emptyConditions();
  let conditionsUnavailable = false;
  try { conditions = await listSiteConditions(); }
  catch {
    conditionsUnavailable = true;
    conditions = conditions.map(condition => ({ ...condition, status: "unknown" }));
  }
  const canEditConditions = Boolean(process.env.ADMIN_PASSWORD?.trim()) && await isAdminAuthenticated(await cookies());

  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([{ name: "Accueil", path: "/" }])} />

      <Hero
        eyebrow="Bienvenue au Golf de Marcilly"
        playCta={{ label: "Jouer au golf", href: "/golf" }}
        appCta={{ label: "Télécharger FlashGolf", href: siteConfig.flashGolfUrl }}
        offersAction={<PromoOffersModal label={activeOffers.length > 0 ? "Voir les offres" : "Black Friday 2026"} offers={activeOffers} />}
        subtitle="Jouez, découvrez le golf ou déjeunez à La Bergerie. À Marcilly-en-Villette, le domaine accueille golfeurs, débutants et visiteurs."
        title="45 trous aux portes d’Orléans"
      />

      <SiteConditions conditions={conditions} editable={canEditConditions} unavailable={conditionsUnavailable} preview={process.env.PREVIEW_MODE === "true"} />

      <section aria-labelledby="discovery-title" className="border-y border-emerald-950/10 bg-emerald-50/70 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Vos premiers pas</p>
            <h2 id="discovery-title" className="mt-3 font-serif text-3xl sm:text-4xl">Votre première partie commence ici</h2>
            <p className="mt-4 text-base leading-7 text-emerald-950/80">1 h avec un pro, puis 1 h 30 sur le parcours 9 trous en autonomie. Le matériel est fourni dans les deux formules.</p>
          </div>
          <p className="mt-5 text-sm leading-7 text-emerald-950/80">Votre demande sera confirmée par l’équipe selon les disponibilités. Paiement sur place.</p>
          <div className="mt-5 flex flex-wrap gap-3"><CTAButton href="/initiation/reservation">Voir les dates d’initiation</CTAButton><CTAButton href="/je-debute-le-golf" variant="ghost">Comparer les formules</CTAButton></div>
        </div>
      </section>

      <section id="restaurant" className="bg-[#efeadd] py-10 sm:py-14">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] lg:aspect-[3/2]">
            <Image src="/restaurant/gallery/bar.webp" alt="Le bar et la salle du restaurant La Bergerie" fill sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), (max-width: 1280px) calc((100vw - 112px) / 2), 584px" className="object-cover" />
          </div>
          <div>
            <SectionTitle
              eyebrow="Restaurant La Bergerie"
              title="Déjeuner au golf, même sans jouer"
              description="La Bergerie accueille les golfeurs et les visiteurs pour le déjeuner. Consultez la carte, les horaires et demandez votre table."
            />
            <div className="mt-6 flex flex-wrap gap-3"><CTAButton href="/restaurant">Découvrir La Bergerie</CTAButton><CTAButton href="/restaurant#horaires-restaurant" variant="ghost">Consulter les horaires</CTAButton></div>
          </div>
        </div>
      </section>

      <section aria-label="Cours et événements" className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-2 lg:px-8">
        <article id="enseignement" className="scroll-mt-28 rounded-3xl border border-emerald-950/15 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Cours et école de golf</p>
          <h2 className="mt-3 font-serif text-3xl">Progressez avec nos enseignants</h2>
          <div className="mt-5 flex flex-wrap gap-4">{teachingPros.map(pro => <div key={pro.name} className="w-20 text-center"><Image src={pro.image} alt={pro.name} width={80} height={80} sizes="80px" className="h-20 w-20 rounded-2xl object-cover object-top" /><p className="mt-2 text-xs leading-5 text-emerald-950/80"><span className="block">{pro.name.split(" ")[0]}</span><span className="block">{pro.name.split(" ").slice(1).join(" ")}</span></p></div>)}</div>
          <p className="mt-5 text-sm leading-7 text-emerald-950/80">École de golf pour les enfants, cours collectifs et particuliers pour les adultes. Retrouvez les formules et les contacts des pros.</p>
          <div className="mt-5"><CTAButton href="/enseignement">Choisir mon cours</CTAButton></div>
        </article>
        <article id="evenements" className="scroll-mt-28 overflow-hidden rounded-3xl bg-emerald-950 text-white">
          <div className="relative h-36 sm:h-44"><Image src="/restaurant/gallery/buffet-cocktail.jpg" alt="Buffet de bouchées salées préparé pour une réception à La Bergerie" fill sizes="(max-width: 1024px) 90vw, 584px" className="object-cover" /></div>
          <div className="p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">Séminaires et groupes</p><h2 className="mt-3 font-serif text-3xl">Réunissez-vous au golf</h2><p className="mt-4 text-sm leading-7 text-stone-100">Réunion équipée, activité golf et restauration sur place : présentez-nous votre projet pour une proposition adaptée.</p><div className="mt-5"><CTAButton href="/evenements#devis" variant="secondary">Demander un devis</CTAButton></div></div>
        </article>
      </section>

      <nav aria-label="Actualités et compétitions" className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 py-6 sm:px-6 lg:px-8">
        <CTAButton href="/actualites" variant="secondary">Actualités et conseils</CTAButton>
        <CTAButton href="/association-sportive#competitions" variant="secondary">Calendrier des compétitions</CTAButton>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionTitle
          description={`${siteConfig.addressLine1}, ${siteConfig.addressLine2}.`}
          eyebrow="Carte / accès"
          title="Un accès simple depuis Orléans"
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <MapEmbed src={siteConfig.mapImageUrl} href={siteConfig.mapExternalUrl} title="Accès Golf de Marcilly" />
          <div className="rounded-[32px] border border-emerald-950/10 bg-white p-8 shadow-sm shadow-emerald-950/5">
            <h2 className="font-serif text-3xl text-emerald-950">Nous contacter</h2>
            <div className="mt-6 space-y-3 text-sm leading-7 text-emerald-950/76">
              <p>{siteConfig.addressLine1}</p>
              <p>{siteConfig.addressLine2}</p>
              <p>
                <a href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>
              </p>
              <p>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href="/contact">Voir la page contact</CTAButton>
              <CTAButton href={`tel:${siteConfig.phoneHref}`} variant="secondary">Appeler le golf</CTAButton>
            </div>
          </div>
        </div>
      </section>
      <div className="border-t border-emerald-950/10 py-6">
        <p className="px-4 text-center text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Ils accompagnent la vie du club</p>
        <SponsorMarquee />
      </div>
    </>
  );
}

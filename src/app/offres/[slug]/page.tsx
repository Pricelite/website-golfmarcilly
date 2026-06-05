import Image from "next/image";
import { notFound } from "next/navigation";

import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { getHomeOfferBySlug, homeOffers } from "@/data/home";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

type OfferPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return homeOffers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({ params }: OfferPageProps) {
  const { slug } = await params;
  const offer = getHomeOfferBySlug(slug);

  if (!offer) {
    return buildMetadata({
      title: "Offre",
      description: "Offre du moment du Golf de Marcilly.",
      path: `/offres/${slug}`,
    });
  }

  return buildMetadata({
    title: offer.title,
    description: `Affiche promotionnelle ${offer.title} du Golf de Marcilly.`,
    path: `/offres/${slug}`,
    image: offer.imageSrc,
  });
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { slug } = await params;
  const offer = getHomeOfferBySlug(slug);

  if (!offer) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: offer.title, path: `/offres/${offer.slug}` },
        ])}
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[36px] border border-emerald-950/10 bg-white p-4 shadow-xl shadow-emerald-950/10 sm:p-6">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-4xl overflow-hidden rounded-[28px] bg-stone-100">
            <Image
              alt={offer.title}
              className="object-contain"
              fill
              priority
              sizes="100vw"
              src={offer.imageSrc}
            />
          </div>
          <div className="mt-6 flex justify-center">
            <CTAButton href={offer.actionHref}>{offer.actionLabel}</CTAButton>
          </div>
        </div>
      </section>
    </>
  );
}

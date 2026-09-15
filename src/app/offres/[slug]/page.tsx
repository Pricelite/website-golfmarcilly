import Image from "next/image";
import { notFound } from "next/navigation";

import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { getSiteOfferBySlug, siteOffers } from "@/data/offers";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema } from "@/lib/schema";

type OfferPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return siteOffers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({ params }: OfferPageProps) {
  const { slug } = await params;
  const offer = getSiteOfferBySlug(slug);

  if (!offer) {
    notFound();
  }

  return buildMetadata({
    title: offer.title,
    description: offer.description,
    path: `/offres/${slug}`,
    image: offer.imageSrc,
  });
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { slug } = await params;
  const offer = getSiteOfferBySlug(slug);

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
        <h1 className="font-serif text-4xl text-emerald-950">{offer.title}</h1>
        <p className="mb-8 mt-4 max-w-3xl text-base leading-7 text-emerald-950/80">{offer.description}</p>
        <div className="rounded-[36px] border border-emerald-950/10 bg-white p-4 shadow-xl shadow-emerald-950/10 sm:p-6">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-4xl overflow-hidden rounded-[28px] bg-stone-100">
            <Image
              alt={offer.title}
              className="object-contain"
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 64px), (max-width: 1024px) calc(100vw - 96px), 896px"
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

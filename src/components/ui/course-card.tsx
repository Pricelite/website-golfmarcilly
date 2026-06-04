import Image from "next/image";

import { CTAButton } from "@/components/ui/cta-button";

type CourseCardProps = {
  title: string;
  description: string;
  level: string;
  distance: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  showMeta?: boolean;
};

export function CourseCard({
  title,
  description,
  level,
  distance,
  ctaLabel,
  ctaHref,
  image,
  showMeta = true,
}: CourseCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[32px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
      <div className="relative aspect-[4/3]">
        <Image
          alt={title}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          src={image}
        />
      </div>
      <div className="flex h-full flex-col space-y-4 p-6">
        {showMeta ? (
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            <span>{level}</span>
            <span aria-hidden="true">•</span>
            <span>{distance}</span>
          </div>
        ) : null}
        <h3 className="font-serif text-2xl text-emerald-950">{title}</h3>
        <p className="flex-1 text-sm leading-7 text-emerald-950/76">{description}</p>
        <CTAButton className="mt-auto" href={ctaHref}>
          {ctaLabel}
        </CTAButton>
      </div>
    </article>
  );
}

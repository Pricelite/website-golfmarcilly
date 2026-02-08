import type { CSSProperties } from "react";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  overlay?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
};

export default function PageHero({
  title,
  subtitle,
  backgroundImage,
  overlay = true,
  ctaLabel,
  ctaHref,
  ctaExternal = false,
}: PageHeroProps) {
  const hasBackground = Boolean(backgroundImage);
  const style: CSSProperties | undefined = hasBackground
    ? {
        ["--hero-image" as string]: `url('${backgroundImage}')`,
        ["--hero-overlay" as string]: overlay
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 45%, rgba(0, 0, 0, 0.25) 100%)"
          : "linear-gradient(transparent, transparent)",
      }
    : undefined;

  return (
    <section className={`hero ${hasBackground ? "hero--image" : ""}`} style={style}>
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20 md:py-24">
        <div className="max-w-2xl rounded-[32px] bg-white/75 p-10 shadow-2xl shadow-emerald-900/10 backdrop-blur">
          <h1 className="font-[var(--font-display)] text-4xl leading-tight text-emerald-950 md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-base leading-7 text-emerald-900/80">
              {subtitle}
            </p>
          ) : null}
          {ctaLabel && ctaHref ? (
            <a
              className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-800"
              href={ctaHref}
              target={ctaExternal ? "_blank" : undefined}
              rel={ctaExternal ? "noopener noreferrer" : undefined}
            >
              {ctaLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

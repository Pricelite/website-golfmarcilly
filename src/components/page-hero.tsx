import type { CSSProperties } from "react";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  overlay?: boolean;
  compact?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
};

export default function PageHero({
  title,
  subtitle,
  backgroundImage,
  overlay = true,
  compact = false,
  ctaLabel,
  ctaHref,
  ctaExternal = false,
}: PageHeroProps) {
  const hasBackground = Boolean(backgroundImage);
  const style: CSSProperties | undefined =
    compact || hasBackground
      ? {
          ...(compact ? { minHeight: "75vh" } : {}),
          ...(hasBackground
            ? {
                ["--hero-image" as string]: `url('${backgroundImage}')`,
                ["--hero-overlay" as string]: overlay
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 45%, rgba(0, 0, 0, 0.25) 100%)"
                  : "linear-gradient(transparent, transparent)",
              }
            : {}),
        }
      : undefined;

  const wrapperPadding = compact ? "py-12 md:py-14" : "py-20 md:py-24";
  const cardPadding = compact ? "p-7 md:p-8" : "p-10";

  return (
    <section className="hero" style={style}>
      {hasBackground ? (
        <>
          <div className="absolute inset-0 z-0 overflow-hidden">
            <iframe
              className="absolute inset-0 h-full w-full scale-[1.25] origin-center"
              src="https://www.youtube.com/embed/WhMJjUGpr5c?autoplay=1&mute=1&loop=1&playlist=WhMJjUGpr5c&controls=0&modestbranding=1&playsinline=1&rel=0"
              title="Video de presentation du golf"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          {overlay ? (
            <div className="pointer-events-none absolute inset-0 z-[1] bg-emerald-950/60" />
          ) : null}
        </>
      ) : null}
      <div className={`relative z-10 mx-auto w-full max-w-6xl px-6 ${wrapperPadding}`}>
        <div
          className={`max-w-2xl rounded-[32px] bg-white/75 ${cardPadding} shadow-2xl shadow-emerald-900/10 backdrop-blur`}
        >
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

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { toProtectedImageSrc } from "@/lib/protected-image";

type PageHeroProps = {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  overlay?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  ctaExternal?: boolean;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  secondaryCtaExternal?: boolean;
  tertiaryCtaLabel?: string;
  tertiaryCtaHref?: string;
  tertiaryCtaExternal?: boolean;
  children?: ReactNode;
};

function isExternalLink(href: string, external?: boolean) {
  if (external) {
    return true;
  }

  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

function HeroCtaButton({
  label,
  href,
  external,
  variant,
}: {
  label: string;
  href: string;
  external?: boolean;
  variant: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-800"
      : "inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50";

  if (isExternalLink(href, external)) {
    return (
      <a
        className={className}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {label}
      </a>
    );
  }

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}

type HeroCta = {
  label: string;
  href: string;
  external?: boolean;
};

export default function PageHero({
  title,
  subtitle,
  description,
  backgroundImage,
  overlay = true,
  ctaLabel,
  ctaHref,
  ctaExternal = false,
  secondaryCtaLabel,
  secondaryCtaHref,
  secondaryCtaExternal = false,
  tertiaryCtaLabel,
  tertiaryCtaHref,
  tertiaryCtaExternal = false,
  children,
}: PageHeroProps) {
  const hasBackground = Boolean(backgroundImage);
  const protectedBackgroundImage = backgroundImage
    ? toProtectedImageSrc(backgroundImage)
    : undefined;
  const style: CSSProperties | undefined = hasBackground
    ? {
        ["--hero-image" as string]: `url('${protectedBackgroundImage}')`,
        ["--hero-overlay" as string]: overlay
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 45%, rgba(0, 0, 0, 0.25) 100%)"
          : "linear-gradient(transparent, transparent)",
      }
    : undefined;
  const ctas: HeroCta[] = [];

  if (ctaLabel && ctaHref) {
    ctas.push({ label: ctaLabel, href: ctaHref, external: ctaExternal });
  }

  if (secondaryCtaLabel && secondaryCtaHref) {
    ctas.push({
      label: secondaryCtaLabel,
      href: secondaryCtaHref,
      external: secondaryCtaExternal,
    });
  }

  if (tertiaryCtaLabel && tertiaryCtaHref) {
    ctas.push({
      label: tertiaryCtaLabel,
      href: tertiaryCtaHref,
      external: tertiaryCtaExternal,
    });
  }

  return (
    <section className={`hero ${hasBackground ? "hero--image" : ""}`} style={style}>
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-14 md:py-16">
        <div className="max-w-2xl rounded-[32px] bg-white/75 p-10 shadow-2xl shadow-emerald-900/10 backdrop-blur">
          <h1 className="font-[var(--font-display)] text-4xl leading-tight text-emerald-950 md:text-5xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 text-base leading-7 text-emerald-900/80">
              {subtitle}
            </p>
          ) : null}
          {description ? (
            <p className="mt-3 text-sm leading-7 text-emerald-900/70">
              {description}
            </p>
          ) : null}
          {ctas.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {ctas.map((cta, index) => (
                <HeroCtaButton
                  key={`${cta.label}-${cta.href}`}
                  label={cta.label}
                  href={cta.href}
                  external={cta.external}
                  variant={index === 0 ? "primary" : "secondary"}
                />
              ))}
            </div>
          ) : null}
          {children ? <div className="mt-4 flex flex-wrap gap-3">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

import PageHero from "@/components/page-hero";

type PageCta = {
  label: string;
  href: string;
  external?: boolean;
};

type StandardPageProps = {
  title: string;
  subtitle: string;
  description: string;
  eyebrow?: string;
  cta?: PageCta;
  secondaryCta?: PageCta;
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

function CtaButton({
  cta,
  variant,
}: {
  cta: PageCta;
  variant: "primary" | "secondary";
}) {
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-full bg-emerald-900 px-6 py-3 text-sm font-semibold text-emerald-50 shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800"
      : "inline-flex items-center justify-center rounded-full border border-emerald-900/20 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50";

  if (isExternalLink(cta.href, cta.external)) {
    return (
      <a
        className={className}
        href={cta.href}
        target={cta.external ? "_blank" : undefined}
        rel={cta.external ? "noopener noreferrer" : undefined}
      >
        {cta.label}
      </a>
    );
  }

  return (
    <Link className={className} href={cta.href}>
      {cta.label}
    </Link>
  );
}

export default function StandardPage({
  title,
  subtitle,
  description,
  eyebrow,
  cta,
  secondaryCta,
}: StandardPageProps) {
  return (
    <div className="text-emerald-950">
      <PageHero title={title} subtitle={subtitle} />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          {eyebrow ? (
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-4 font-[var(--font-display)] text-2xl text-emerald-950">
            Contenu en cours de finalisation
          </h2>
          <p className="mt-3 text-sm leading-6 text-emerald-900/70">
            {description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {cta ? <CtaButton cta={cta} variant="primary" /> : null}
            {secondaryCta ? (
              <CtaButton cta={secondaryCta} variant="secondary" />
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

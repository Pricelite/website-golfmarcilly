type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  tone?: "default" | "inverse";
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  as = "h2",
  tone = "default",
}: SectionTitleProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const HeadingTag = as;

  return (
    <div className={alignClass}>
      {eyebrow ? (
        <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${tone === "inverse" ? "text-stone-200" : "text-emerald-700"}`}>
          {eyebrow}
        </p>
      ) : null}
      <HeadingTag className={`mt-3 font-serif text-3xl sm:text-4xl ${tone === "inverse" ? "text-stone-50" : "text-emerald-950"}`}>
        {title}
      </HeadingTag>
      {description ? (
        <p className={`mt-4 max-w-3xl text-sm leading-7 sm:text-base ${tone === "inverse" ? "text-stone-50/80" : "text-emerald-950/72"}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

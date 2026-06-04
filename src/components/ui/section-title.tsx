type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionTitleProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={alignClass}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-3 font-serif text-3xl text-emerald-950 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-3xl text-sm leading-7 text-emerald-950/72 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

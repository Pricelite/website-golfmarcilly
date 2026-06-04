export function FeatureCard({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <article className="rounded-[28px] border border-emerald-950/10 bg-white/75 p-7 shadow-sm shadow-emerald-950/5 backdrop-blur">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-3 font-serif text-2xl text-emerald-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-emerald-950/75">{description}</p>
    </article>
  );
}

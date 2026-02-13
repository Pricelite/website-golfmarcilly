type PublicCalendarEmbedProps = {
  title: string;
  src: string;
  sectionBorderClassName?: string;
  frameBorderClassName?: string;
  highlightWeekends?: boolean;
};

export default function PublicCalendarEmbed({
  title,
  src,
  sectionBorderClassName = "border-emerald-900/10",
  frameBorderClassName = "border-emerald-900/10",
  highlightWeekends = false,
}: PublicCalendarEmbedProps) {
  return (
    <section
      className={`rounded-[32px] border bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur ${sectionBorderClassName}`}
    >
      <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
        {title}
      </p>
      <div
        className={`relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl border bg-white ${frameBorderClassName}`}
      >
        {highlightWeekends ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[28.5714%] bg-blue-700/60 mix-blend-color"
          />
        ) : null}
        <iframe
          src={src}
          title={title}
          className="relative z-0 h-full w-full border-0"
          loading="lazy"
        />
      </div>
      {highlightWeekends ? (
        <p className="mt-3 text-xs text-blue-900/80">
          Samedi et dimanche passent en bleu à la place du vert.
        </p>
      ) : null}
    </section>
  );
}

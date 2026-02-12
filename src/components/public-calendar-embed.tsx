type PublicCalendarEmbedProps = {
  title: string;
  src: string;
  sectionBorderClassName?: string;
  frameBorderClassName?: string;
};

export default function PublicCalendarEmbed({
  title,
  src,
  sectionBorderClassName = "border-emerald-900/10",
  frameBorderClassName = "border-emerald-900/10",
}: PublicCalendarEmbedProps) {
  return (
    <section
      className={`rounded-[32px] border bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur ${sectionBorderClassName}`}
    >
      <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
        {title}
      </p>
      <div
        className={`mt-4 aspect-[16/10] overflow-hidden rounded-2xl border bg-white ${frameBorderClassName}`}
      >
        <iframe
          src={src}
          title={title}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
    </section>
  );
}

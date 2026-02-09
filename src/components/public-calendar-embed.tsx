type PublicCalendarEmbedProps = {
  title: string;
  src: string;
};

export default function PublicCalendarEmbed({
  title,
  src,
}: PublicCalendarEmbedProps) {
  return (
    <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
        {title}
      </p>
      <div className="mt-4 aspect-[16/10] overflow-hidden rounded-2xl border border-emerald-900/10 bg-white">
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

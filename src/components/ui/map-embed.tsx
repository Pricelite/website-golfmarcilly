export function MapEmbed({ title, src }: { title: string; src: string }) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
      <iframe
        allowFullScreen
        className="h-[420px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={src}
        title={title}
      />
    </div>
  );
}

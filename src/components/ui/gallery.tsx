import Image from "next/image";

export function Gallery({
  items,
}: {
  items: Array<{ src: string; alt: string }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <figure
          className="relative overflow-hidden rounded-[26px] border border-emerald-950/10 bg-white"
          key={item.src}
        >
          <div className="relative aspect-[4/3]">
            <Image
              alt={item.alt}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              src={item.src}
            />
          </div>
        </figure>
      ))}
    </div>
  );
}

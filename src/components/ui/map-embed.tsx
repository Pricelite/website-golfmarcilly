import Image from "next/image";

export function MapEmbed({ title, src, href }: { title: string; src: string; href: string }) {
  return (
    <div className="relative h-[420px] overflow-hidden rounded-[32px] border border-emerald-950/10 bg-white shadow-sm shadow-emerald-950/5">
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${title} : ouvrir la carte satellite interactive (nouvel onglet)`} className="group block h-full w-full focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-emerald-700">
        <Image src={src} alt="Vue satellite du Golf de Marcilly et de ses parcours" fill unoptimized sizes="(max-width: 1024px) 100vw, 640px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
        <span className="absolute bottom-4 left-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg">Ouvrir la carte satellite <span aria-hidden="true">↗</span></span>
      </a>
      <span className="absolute bottom-3 right-3 rounded bg-emerald-950/85 px-2 py-1 text-[10px] text-white">Imagerie © Esri et contributeurs</span>
    </div>
  );
}

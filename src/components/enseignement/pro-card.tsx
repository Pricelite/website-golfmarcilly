import Image from "next/image";

import { toProtectedImageSrc } from "@/lib/protected-image";

type ProCardProps = {
  name: string;
  specialty: string;
  imageSrc?: string;
  website?: string;
};

export default function ProCard({ name, specialty, imageSrc, website }: ProCardProps) {
  return (
    <article className="rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm">
      <div className="relative h-56 overflow-hidden rounded-2xl border border-emerald-900/10 bg-emerald-50">
        {imageSrc ? (
          <Image
            src={toProtectedImageSrc(imageSrc)}
            alt={name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover object-center"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.25em] text-emerald-700">
            Photo
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-emerald-950">
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-emerald-700/40 underline-offset-2 hover:text-emerald-700"
            >
              {name}
            </a>
          ) : (
            name
          )}
        </h3>
        <p className="mt-1 text-sm text-emerald-900/70">{specialty}</p>
      </div>
    </article>
  );
}

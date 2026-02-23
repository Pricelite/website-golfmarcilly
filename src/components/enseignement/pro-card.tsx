import Image from "next/image";

import { toProtectedImageSrc } from "@/lib/protected-image";

type ProCardProps = {
  name: string;
  specialty: string;
  imageSrc?: string;
  website?: string;
  phoneHref?: string;
  emailHref?: string;
  phoneLabel?: string;
  emailLabel?: string;
};

export default function ProCard({
  name,
  specialty,
  imageSrc,
  website,
  phoneHref,
  emailHref,
  phoneLabel,
  emailLabel,
}: ProCardProps) {
  const displayedPhone = phoneLabel ?? phoneHref?.replace(/^tel:/, "");
  const displayedEmail = emailLabel ?? emailHref?.replace(/^mailto:/, "");

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
        <div className="flex items-center justify-between gap-3">
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
          <div className="inline-flex items-center gap-1.5">
            {phoneHref && displayedPhone ? (
              <span className="group relative">
                <a
                  href={phoneHref}
                  aria-label={`Telephoner a ${name}`}
                  title={`Telephoner a ${name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-900/20 bg-white text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d="M6.8 3.8h2.7l1.4 3.4-1.8 1.8a15.6 15.6 0 0 0 5.8 5.8l1.8-1.8 3.4 1.4v2.7a1.8 1.8 0 0 1-1.8 1.8A15.5 15.5 0 0 1 4.9 5.6 1.8 1.8 0 0 1 6.8 3.8z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <p className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-xl border border-emerald-900/15 bg-white/95 px-3 py-1.5 text-xs font-medium text-emerald-950 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  {displayedPhone}
                </p>
              </span>
            ) : null}

            {emailHref && displayedEmail ? (
              <span className="group relative">
                <a
                  href={emailHref}
                  aria-label={`Envoyer un e-mail a ${name}`}
                  title={`Envoyer un e-mail a ${name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-900/20 bg-white text-emerald-900 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d="M3.8 6.2h16.4c.6 0 1 .4 1 1v9.6c0 .6-.4 1-1 1H3.8c-.6 0-1-.4-1-1V7.2c0-.6.4-1 1-1z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 7l9 6 9-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <p className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-xl border border-emerald-900/15 bg-white/95 px-3 py-1.5 text-xs font-medium text-emerald-950 opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
                  {displayedEmail}
                </p>
              </span>
            ) : null}
          </div>
        </div>
        <p className="mt-1 text-sm text-emerald-900/70">{specialty}</p>
      </div>
    </article>
  );
}

"use client";

import { useEffect, useState } from "react";

type PublicCalendarEmbedProps = {
  title: string;
  src: string;
  sectionBorderClassName?: string;
  frameBorderClassName?: string;
  frameAspectClassName?: string;
  highlightWeekends?: boolean;
};

function getIframeRefreshIntervalMs(): number {
  const raw = process.env.NEXT_PUBLIC_CALENDAR_IFRAME_REFRESH_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  const seconds = Number.isFinite(parsed) && parsed > 0 ? parsed : 300;

  return seconds * 1000;
}

const IFRAME_REFRESH_INTERVAL_MS = getIframeRefreshIntervalMs();

function withRefreshToken(src: string, token: string): string {
  try {
    const url = new URL(src);
    url.searchParams.set("_r", token);
    return url.toString();
  } catch {
    const hasQuery = src.includes("?");
    return `${src}${hasQuery ? "&" : "?"}_r=${encodeURIComponent(token)}`;
  }
}

export default function PublicCalendarEmbed({
  title,
  src,
  sectionBorderClassName = "border-emerald-900/10",
  frameBorderClassName = "border-emerald-900/10",
  frameAspectClassName = "aspect-[16/10]",
  highlightWeekends = false,
}: PublicCalendarEmbedProps) {
  const [refreshToken, setRefreshToken] = useState<string>(() => Date.now().toString());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRefreshToken(Date.now().toString());
    }, IFRAME_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const iframeSrc = withRefreshToken(src, refreshToken);

  return (
    <section
      className={`rounded-[32px] border bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur ${sectionBorderClassName}`}
    >
      <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
        {title}
      </p>
      <div
        className={`relative mt-4 overflow-hidden rounded-2xl border bg-white ${frameAspectClassName} ${frameBorderClassName}`}
      >
        {highlightWeekends ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[28.5714%] bg-blue-600/55 mix-blend-multiply"
          />
        ) : null}
        <iframe
          src={iframeSrc}
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

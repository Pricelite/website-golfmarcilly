"use client";

import { useEffect, useState } from "react";
import type { AnnouncementItem } from "@/lib/calendar-announcement-items";

const DEFAULT_FALLBACK_TEXT = "Aucune competition dans les 7 prochains jours.";

function getPollIntervalMs(): number {
  const raw = process.env.NEXT_PUBLIC_CALENDAR_POLL_SECONDS;
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  const seconds = Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
  return seconds * 1000;
}

const POLL_INTERVAL_MS = getPollIntervalMs();

type AnnouncementMarqueeClientProps = {
  initialItems: AnnouncementItem[];
};

export default function AnnouncementMarqueeClient({
  initialItems,
}: AnnouncementMarqueeClientProps) {
  const [items, setItems] = useState<AnnouncementItem[]>(initialItems);

  useEffect(() => {
    let active = true;

    async function refreshAnnouncements() {
      try {
        const response = await fetch("/api/calendar-announcements?daysAhead=7", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          announcements?: AnnouncementItem[];
        };

        if (!active || !Array.isArray(payload.announcements)) {
          return;
        }

        setItems(payload.announcements);
      } catch {
        // Keep current announcements if polling fails.
      }
    }

    void refreshAnnouncements();
    const intervalId = window.setInterval(refreshAnnouncements, POLL_INTERVAL_MS);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const marqueeItems =
    items.length > 0
      ? items
      : [{ id: "no-event", text: DEFAULT_FALLBACK_TEXT } satisfies AnnouncementItem];

  const renderItemContent = (item: AnnouncementItem) => {
    const className = "announcement-marquee__item text-xs font-semibold text-black";

    if (item.url) {
      return (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${className} hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200`}
          aria-label={`Acceder a l'annonce: ${item.text}`}
          title="Acceder a l'annonce"
        >
          {item.text}
        </a>
      );
    }

    return <span className={className}>{item.text}</span>;
  };

  return (
    <section
      className="announcement-marquee border-b border-emerald-900/15 bg-emerald-100 text-black"
      aria-label="Competitions du calendrier"
    >
      <div className="w-full px-6 py-1.5">
        <div className="announcement-marquee__viewport w-full overflow-hidden">
          <div className="announcement-marquee__track flex w-max items-center whitespace-nowrap">
            {marqueeItems.map((item, index) => (
              <span key={`${item.id}-${index}`} className="inline-flex items-center">
                {renderItemContent(item)}
                {index < marqueeItems.length - 1 ? (
                  <span className="px-3 text-emerald-900/70" aria-hidden="true">
                    |
                  </span>
                ) : null}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


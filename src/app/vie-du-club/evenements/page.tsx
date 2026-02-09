import type { Metadata } from "next";

import PageHero from "@/components/page-hero";
import PublicCalendarEmbed from "@/components/public-calendar-embed";
import { CALENDAR_EMBED_URL } from "@/lib/calendar";

export const metadata: Metadata = {
  title: "Evenements",
  description: "Calendrier public des evenements du club.",
};

export default function Page() {
  return (
    <div className="text-emerald-950">
      <PageHero
        title="Evenements"
        subtitle="Retrouvez le calendrier public des evenements du club."
      />

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <section className="rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">
            Vie du club
          </p>
          <p className="mt-4 text-sm leading-6 text-emerald-900/70">
            Consultez les prochaines dates et animations du club.
          </p>
        </section>

        <div className="mt-8">
          <PublicCalendarEmbed
            title="Calendrier public du club"
            src={CALENDAR_EMBED_URL}
          />
        </div>
      </main>
    </div>
  );
}

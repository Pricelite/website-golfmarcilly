import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Événements",
  description: "Tournois, soirées et animations du club.",
};

export default function Page() {
  return (
    <StandardPage
      title="Événements"
      subtitle="Tournois, soirées et animations."
      eyebrow="Vie du club"
      description="Le calendrier des tournois, soirées et animations arrive."
      cta={{ label: "Recevoir le programme", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Retour vie du club", href: "/vie-du-club" }}
    />
  );
}

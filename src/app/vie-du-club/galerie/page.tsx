import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Photos du parcours et des événements du club.",
};

export default function Page() {
  return (
    <StandardPage
      title="Galerie"
      subtitle="Photos du parcours et des événements."
      eyebrow="Vie du club"
      description="La galerie photo du parcours et des événements arrive prochainement."
      cta={{ label: "Envoyer une photo", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Retour vie du club", href: "/vie-du-club" }}
    />
  );
}

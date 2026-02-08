import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_PHONE_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Carte & menus",
  description: "Carte du restaurant, menus et suggestions du chef.",
};

export default function Page() {
  return (
    <StandardPage
      title="Carte & menus"
      subtitle="Une offre gourmande pour joueurs et visiteurs."
      eyebrow="Restaurant"
      description="La carte détaillée, les menus du jour et les offres du chef seront publiés ici."
      cta={{ label: "Réserver une table", href: CONTACT_PHONE_LINK }}
      secondaryCta={{ label: "Voir les horaires", href: "/restaurant/horaires" }}
    />
  );
}

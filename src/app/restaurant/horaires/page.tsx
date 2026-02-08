import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_PHONE_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Horaires",
  description: "Horaires d'ouverture du restaurant et du bar du club house.",
};

export default function Page() {
  return (
    <StandardPage
      title="Horaires"
      subtitle="Ouverture du restaurant et du bar."
      eyebrow="Restaurant"
      description="Nous mettons à jour les horaires du restaurant, du bar et de la terrasse selon la saison."
      cta={{ label: "Appeler le restaurant", href: CONTACT_PHONE_LINK }}
      secondaryCta={{ label: "Voir la carte", href: "/restaurant/carte-menus" }}
    />
  );
}

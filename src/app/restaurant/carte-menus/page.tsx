import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_PHONE_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Carte & menus",
  description:
    "Découvrez la carte du moment et les menus proposés par le restaurant La Bergerie.",
};

export default function Page() {
  return (
    <StandardPage
      title="Carte & menus"
      subtitle="La carte du moment et les menus de groupes."
      eyebrow="Restaurant"
      description="Retrouvez ici nos suggestions de saison. Pour toute demande spécifique ou un menu de groupe, contactez notre équipe."
      cta={{ label: "Réserver une table", href: CONTACT_PHONE_LINK }}
      secondaryCta={{ label: "Voir le restaurant", href: "/restaurant" }}
    />
  );
}

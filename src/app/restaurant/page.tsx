import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_PHONE_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Restaurant",
  description: "Découvrez le restaurant du club : cuisine de saison, terrasse et convivialité.",
};

export default function Page() {
  return (
    <StandardPage
      title="Restaurant"
      subtitle="Cuisine de saison et vue sur le parcours."
      eyebrow="Restaurant"
      description="Les menus, horaires et modalités de réservation arrivent. Notre équipe finalise la présentation des offres."
      cta={{ label: "Réserver une table", href: CONTACT_PHONE_LINK }}
      secondaryCta={{ label: "Voir la carte", href: "/restaurant/carte-menus" }}
    />
  );
}

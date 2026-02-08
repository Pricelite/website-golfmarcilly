import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cours individuels",
  description: "Cours particuliers et accompagnement personnalisé.",
};

export default function Page() {
  return (
    <StandardPage
      title="Cours individuels"
      subtitle="Un accompagnement personnalisé pour progresser."
      eyebrow="Enseignement"
      description="Les créneaux, tarifs et profils des enseignants seront disponibles bientôt."
      cta={{ label: "Réserver un créneau", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Voir l'enseignement", href: "/enseignement" }}
    />
  );
}

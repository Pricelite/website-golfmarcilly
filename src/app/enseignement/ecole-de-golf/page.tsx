import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "École de golf",
  description: "Parcours d'apprentissage pour jeunes et débutants.",
};

export default function Page() {
  return (
    <StandardPage
      title="École de golf"
      subtitle="Parcours encadrés pour les jeunes et débutants."
      eyebrow="Enseignement"
      description="Les informations sur les groupes, horaires et niveaux sont en préparation."
      cta={{ label: "Demander des infos", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Voir l'enseignement", href: "/enseignement" }}
    />
  );
}

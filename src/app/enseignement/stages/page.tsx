import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stages",
  description: "Stages intensifs et programmes de progression.",
};

export default function Page() {
  return (
    <StandardPage
      title="Stages"
      subtitle="Programmes intensifs sur plusieurs jours."
      eyebrow="Enseignement"
      description="Le calendrier des stages et conditions d'inscription seront publiés ici."
      cta={{ label: "Pré-inscription", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Voir l'enseignement", href: "/enseignement" }}
    />
  );
}

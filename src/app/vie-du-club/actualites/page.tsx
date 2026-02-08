import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Infos et nouvelles du Golf de Marcilly-Orléans.",
};

export default function Page() {
  return (
    <StandardPage
      title="Actualités"
      subtitle="Infos du club et annonces récentes."
      eyebrow="Vie du club"
      description="Les dernières nouvelles du club seront publiées ici."
      cta={{ label: "S'abonner aux infos", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Retour vie du club", href: "/vie-du-club" }}
    />
  );
}

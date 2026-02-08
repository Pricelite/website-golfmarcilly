import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Adhésion",
  description: "Devenir membre de l'association sportive.",
};

export default function Page() {
  return (
    <StandardPage
      title="Adhésion"
      subtitle="Rejoindre l'association sportive."
      eyebrow="Association sportive"
      description="Les documents d'adhésion et tarifs seront disponibles prochainement."
      cta={{ label: "Demander l'adhésion", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Retour association", href: "/association-sportive" }}
    />
  );
}

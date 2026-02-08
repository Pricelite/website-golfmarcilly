import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Compétitions",
  description: "Calendrier des compétitions et inscriptions.",
};

export default function Page() {
  return (
    <StandardPage
      title="Compétitions"
      subtitle="Calendrier et modalités d'inscription."
      eyebrow="Association sportive"
      description="Le calendrier, les règlements et les inscriptions seront publiés ici."
      cta={{ label: "Recevoir le calendrier", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Retour association", href: "/association-sportive" }}
    />
  );
}

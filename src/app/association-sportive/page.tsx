import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Association sportive",
  description: "Compétitions, équipes et vie sportive du club.",
};

export default function Page() {
  return (
    <StandardPage
      title="Association sportive"
      subtitle="Compétitions, équipes et vie sportive du club."
      eyebrow="Association sportive"
      description="Nous préparons la page avec règlements, calendrier et modalités d'adhésion."
      cta={{ label: "Rejoindre l'association", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Voir les compétitions", href: "/association-sportive/competitions" }}
    />
  );
}

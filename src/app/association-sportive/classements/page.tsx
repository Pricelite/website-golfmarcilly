import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Classements",
  description: "Classements internes et interclubs du club.",
};

export default function Page() {
  return (
    <StandardPage
      title="Classements"
      subtitle="Suivi des performances et classements internes."
      eyebrow="Association sportive"
      description="Les classements internes et interclubs seront mis à jour sur cette page."
      cta={{ label: "Nous contacter", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Retour association", href: "/association-sportive" }}
    />
  );
}

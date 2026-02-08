import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK, CONTACT_PHONE_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Coordonnées, accès et informations pratiques pour joindre le club.",
};

export default function Page() {
  return (
    <StandardPage
      title="Contact"
      subtitle="Nous sommes à votre écoute pour toute question ou réservation."
      eyebrow="Contact"
      description="Cette page détaillera prochainement les accès, horaires d'accueil et un formulaire. En attendant, contactez-nous directement."
      cta={{ label: "Envoyer un email", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Appeler le club", href: CONTACT_PHONE_LINK }}
    />
  );
}

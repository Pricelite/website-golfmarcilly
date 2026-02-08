import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK, CONTACT_PHONE_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Réservation",
  description: "Réservez votre table au restaurant du Golf de Marcilly-Orléans.",
};

export default function Page() {
  return (
    <StandardPage
      title="Réservation"
      subtitle="Anticipez votre déjeuner au club house."
      eyebrow="Restaurant"
      description="La réservation en ligne est en préparation. En attendant, réservez par téléphone ou par email."
      cta={{ label: "Appeler pour réserver", href: CONTACT_PHONE_LINK }}
      secondaryCta={{ label: "Envoyer un email", href: CONTACT_EMAIL_LINK }}
    />
  );
}

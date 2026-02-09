import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK, CONTACT_PHONE_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reservation",
  description: "Reservation du restaurant du club.",
};

export default function Page() {
  return (
    <StandardPage
      title="Reservation"
      subtitle="Anticipez votre dejeuner au club house."
      eyebrow="Restaurant"
      description="La reservation en ligne est en preparation. En attendant, reservez par telephone ou par email."
      cta={{ label: "Appeler pour reserver", href: CONTACT_PHONE_LINK }}
      secondaryCta={{ label: "Envoyer un email", href: CONTACT_EMAIL_LINK }}
    />
  );
}

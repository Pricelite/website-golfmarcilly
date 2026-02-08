import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";

export const metadata: Metadata = {
  title: "Vie du club",
  description: "Actualités, événements et moments forts du club.",
};

export default function Page() {
  return (
    <StandardPage
      title="Vie du club"
      subtitle="Actualités, événements et moments forts."
      eyebrow="Vie du club"
      description="Nous préparons des rubriques dédiées aux actualités, événements et galeries."
      cta={{ label: "Voir les actualités", href: "/vie-du-club/actualites" }}
      secondaryCta={{ label: "Voir les événements", href: "/vie-du-club/evenements" }}
    />
  );
}

import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";

export const metadata: Metadata = {
  title: "Tarifs 2026 - Vie du club",
  description:
    "Consultez la page des tarifs 2026 du Golf de Marcilly depuis la rubrique Vie du club.",
};

export default function Page() {
  return (
    <StandardPage
      title="Tarifs 2026"
      subtitle="Informations et acces rapide a la grille tarifaire."
      eyebrow="Vie du club"
      description="La grille complete des tarifs 2026 est disponible sur la page principale dediee."
      cta={{ label: "Voir les tarifs 2026", href: "/tarifs" }}
      secondaryCta={{ label: "Retour vie du club", href: "/vie-du-club" }}
    />
  );
}

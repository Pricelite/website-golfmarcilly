import type { Metadata } from "next";

import StandardPage from "@/components/standard-page";
import { CONTACT_EMAIL_LINK } from "@/lib/site";

export const metadata: Metadata = {
  title: "Enseignement",
  description: "Cours, coaching et stages pour progresser au golf.",
};

export default function Page() {
  return (
    <StandardPage
      title="Enseignement"
      subtitle="Coaching sur mesure pour tous les niveaux."
      eyebrow="Enseignement"
      description="Nous finalisons les informations sur les coachs, les formules et le planning des cours."
      cta={{ label: "Demander un cours", href: CONTACT_EMAIL_LINK }}
      secondaryCta={{ label: "Voir les stages", href: "/enseignement/stages" }}
    />
  );
}

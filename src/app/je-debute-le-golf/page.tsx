import { CTAButton } from "@/components/ui/cta-button";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { pricingSections } from "@/data/pricing";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/schema";

const beginnerFaqs = [
  {
    question: "Faut-il déjà savoir jouer pour venir ?",
    answer:
      "Non. Les initiations accueillent les personnes qui n'ont jamais joué et celles qui souhaitent reprendre les bases.",
  },
  {
    question: "Dois-je avoir mon propre matériel ?",
    answer:
      "Pas obligatoirement. Pour débuter, nous pouvons vous orienter vers une formule simple avant d'investir dans votre propre équipement.",
  },
  {
    question: "Combien de temps faut-il pour commencer à se faire plaisir ?",
    answer:
      "Très vite si l'on commence avec un cadre clair. Une initiation, quelques séances et un bon accompagnement suffisent souvent pour prendre confiance.",
  },
  {
    question: "Puis-je venir seul, en couple ou entre amis ?",
    answer:
      "Oui. Le golf se découvre très bien seul, à deux ou en petit groupe. C'est même souvent une très bonne façon de commencer.",
  },
] as const;

const beginnerSteps = [
  {
    title: "1. Découvrir sans pression",
    description:
      "Une première prise de contact pour comprendre le lieu, l'ambiance et le fonctionnement du golf sans jargon inutile.",
  },
  {
    title: "2. Faire une initiation simple",
    description:
      "Vous prenez vos premiers repères avec un pro ou une formule d'initiation adaptée à votre niveau réel : zéro expérience.",
  },
  {
    title: "3. Continuer à votre rythme",
    description:
      "Poursuivez avec des cours, du practice et vos premiers parcours selon vos envies.",
  },
] as const;

export const metadata = buildMetadata({
  title: "Je débute le golf",
  description:
    "Initiation golf Loiret et premiers cours de golf près d'Orléans. Une page simple pour commencer le golf au Golf de Marcilly.",
  path: "/je-debute-le-golf",
});

export default function BeginnerGolfPage() {
  const discoveryFormulas = pricingSections.find((section) => section.title === "Découverte")?.rows ?? [];
  return (
    <>
      <JsonLd data={buildFaqSchema(beginnerFaqs)} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Accueil", path: "/" },
          { name: "Je débute le golf", path: "/je-debute-le-golf" },
        ])}
      />

      <section className="relative overflow-hidden border-b border-emerald-950/10 bg-emerald-950 text-stone-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(170,206,160,0.22),transparent_28%),linear-gradient(135deg,rgba(6,24,20,0.96),rgba(10,44,35,0.88))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-200/80">
              Initiation golf Loiret
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.95] sm:text-6xl">
              Je débute le golf
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-50/80">
              Découvrez le golf avec une initiation encadrée, puis un parcours
              découverte de 9 trous. Choisissez la formule avec ou sans repas.
            </p>
            <dl className="mt-6 grid gap-5 sm:grid-cols-2">
              {discoveryFormulas.map((formula) => (
                <div key={formula.label} className="border-l-2 border-stone-200/40 pl-4">
                  <dt className="text-base font-semibold">{formula.label}</dt>
                  <dd className="mt-2 text-3xl font-semibold">{formula.values[1]} <span className="text-sm font-normal text-stone-100/80">par personne</span></dd>
                  <dd className="mt-2 text-sm leading-6 text-stone-100/85">{formula.values[0]}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm leading-7 text-stone-100/85">
              Les initiations sont proposées le week-end. Consultez les créneaux
              pour préparer votre venue. Pour toute question sur le matériel,
              appelez le golf au <a className="underline underline-offset-4" href="tel:+33238761173">02 38 76 11 73</a>.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href="/initiation/reservation">Réserver une initiation</CTAButton>
              <CTAButton href="/enseignement" variant="secondary">
                Voir l&apos;enseignement
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            description="De la première découverte aux premiers parcours, avancez étape par étape."
            eyebrow="Comment ça se passe"
            title="Trois étapes simples pour commencer"
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {beginnerSteps.map((step) => (
              <article
                className="rounded-[30px] border border-emerald-950/10 bg-white/92 p-7 shadow-xl shadow-emerald-950/8"
                key={step.title}
              >
                <h3 className="font-serif text-2xl text-emerald-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-emerald-950/76">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <SectionTitle
              description="Expérience, matériel ou venue en groupe : préparez votre première visite."
              eyebrow="FAQ débutant"
              title="Les questions que l&apos;on se pose quand on commence"
            />
            <div className="mt-8">
              <FAQAccordion items={beginnerFaqs} />
            </div>
          </div>
          <div className="rounded-[32px] border border-emerald-950/10 bg-white/92 p-8 shadow-xl shadow-emerald-950/8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Prochaine étape
            </p>
            <h2 className="mt-4 font-serif text-4xl text-emerald-950">
              Réserver votre créneau
            </h2>
            <p className="mt-4 text-sm leading-7 text-emerald-950/76">
              Consultez les créneaux d&apos;initiation et choisissez votre formule.
              Si vous ne trouvez pas de créneau, contactez le golf pour préparer votre venue.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTAButton href="/initiation/reservation">
                Je débute et je réserve
              </CTAButton>
              <CTAButton href="tel:+33238761173" variant="secondary">
                Appeler le golf
              </CTAButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

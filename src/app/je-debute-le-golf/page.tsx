import Image from "next/image";
import Link from "next/link";
import { BeginnerFormulaPicker } from "@/components/beginner-formula-picker";
import { CTAButton } from "@/components/ui/cta-button";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { pricingSections } from "@/data/pricing";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/schema";

const beginnerFaqs = [
  { question: "Je n’ai jamais tenu un club : je peux venir ?", answer: "Oui ! L’initiation est faite pour découvrir les premiers gestes avec un enseignant. Vous commencez par les bases, sans avoir besoin de savoir jouer." },
  { question: "Practice ou initiation : quelle différence ?", answer: "Au practice, vous frappez des balles depuis un poste d’entraînement. L’achat de seaux ne comprend pas un cours. L’initiation comprend un encadrement et un parcours découverte de 9 trous, avec ou sans repas selon la formule." },
  { question: "Faut-il acheter du matériel ?", answer: "Pour le practice, le tarif prévoit le prêt d’un club par seau et par personne. Pour une initiation, renseignez-vous auprès de l’accueil sur le matériel mis à disposition avant votre venue." },
  { question: "Quelle tenue prévoir ?", answer: "Choisissez une tenue confortable qui vous laisse bouger, des chaussures plates et stables, et adaptez-vous à la météo. Pensez à prendre de l’eau et une casquette lorsqu’il fait soleil." },
  { question: "Comment réserver une initiation ?", answer: "Consultez les créneaux proposés le week-end sur la page de réservation. Si aucun créneau ne s’affiche ou si vous avez une question, appelez l’accueil pour organiser votre venue." },
  { question: "Et pour les enfants ?", answer: "L’école de golf accueille les jeunes de 4 à 18 ans. Retrouvez les groupes, horaires et formules sur la page Enseignement, puis contactez l’accueil pour l’inscription." },
] as const;

const steps = [
  { title: "On fait connaissance", text: "Passez à l’accueil pour vous orienter, récupérer les informations utiles et préparer votre première séance.", challenge: "Votre mission : poser toutes vos questions." },
  { title: "On essaie les premiers gestes", text: "À l’initiation, l’enseignant vous accompagne. Au practice, prenez le temps de trouver vos repères : la distance viendra ensuite.", challenge: "Votre mission : chercher un geste souple." },
  { title: "On prend goût au jeu", text: "La formule découverte se poursuit sur 9 trous. Observez, essayez, recommencez : chaque coup est une nouvelle occasion d’apprendre.", challenge: "Votre mission : profiter du parcours !" },
] as const;
const sectionClass = "mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8";

export const metadata = buildMetadata({
  title: "Je débute le golf",
  description: "Découvrez le golf à Marcilly près d’Orléans : premiers pas, tarifs des seaux de balles au practice et initiations à 25 € ou 48 € avec repas.",
  path: "/je-debute-le-golf",
});

export default function BeginnerGolfPage() {
  const discovery = pricingSections.find(section => section.title === "Découverte")!;
  const practice = pricingSections.find(section => section.title === "Practice")!;
  const buckets = practice.rows[0];
  const unlimited = practice.rows[1];
  return (
    <>
      <JsonLd data={buildFaqSchema(beginnerFaqs)} />
      <JsonLd data={buildBreadcrumbSchema([{ name: "Accueil", path: "/" }, { name: "Je débute le golf", path: "/je-debute-le-golf" }])} />
      <section className="relative overflow-hidden bg-[#f7f4e9]">
        <div className={`${sectionClass} grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:py-20`}>
          <div>
            <p className="inline-flex rounded-full border border-emerald-950/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Vos premiers pas · Golf de Marcilly</p>
            <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-emerald-950 sm:text-6xl lg:text-7xl">Le golf commence<br />par un <span className="italic text-emerald-700">premier essai.</span></h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-emerald-950/75">Pas besoin de connaître le swing parfait. Un peu de curiosité, l’envie de prendre l’air, et vous voilà prêt à découvrir le jeu.</p>
            <div className="mt-7 flex flex-wrap gap-3"><CTAButton href="#initiations">Découvrir les initiations</CTAButton><CTAButton href="#practice" variant="secondary">Les seaux de balles</CTAButton></div>
            <p className="mt-5 text-sm text-emerald-950/65">Première fois ? On vous explique tout, étape par étape.</p>
          </div>
          <div className="relative pb-8 sm:pl-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] sm:rounded-t-[100px]">
              <Image src="/images/initiation-groupe-professeur.png" alt="Illustration d’une initiation conviviale au golf avec un professeur et un groupe d’adultes" fill priority sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 72px), 590px" className="object-cover" />
            </div>
            <div className="relative -mt-12 mr-6 flex w-fit items-center gap-4 rounded-2xl bg-white p-5 shadow-lg shadow-emerald-950/10 sm:-ml-6">
              <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-800">↗</span>
              <div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Un premier panier de sensations</p><p className="mt-1 font-serif text-2xl text-emerald-950">{buckets.label} · {buckets.values[0]}</p><p className="mt-1 text-xs text-emerald-950/65">Tarif extérieur · practice sans cours</p></div>
            </div>
          </div>
        </div>
      </section>
      <nav aria-label="Dans cette page" className="border-y border-emerald-950/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-7 gap-y-1 px-4 py-3 sm:px-6 lg:px-8">
          {[["#premiers-pas", "01 · Les premiers pas"], ["#practice", "02 · Le practice"], ["#initiations", "03 · Les initiations"], ["#questions", "04 · Les questions"]].map(([href, label]) => <Link key={href} href={href} className="py-2 text-sm font-medium text-emerald-900 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4">{label}</Link>)}
        </div>
      </nav>
      <section id="premiers-pas" className={sectionClass}>
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <SectionTitle eyebrow="Tout le monde commence un jour" title="Trois petits pas. Beaucoup de plaisir." description="Le but du jeu ? Amener la balle jusqu’au trou avec le moins de coups possible. Pour commencer, on apprend surtout à se sentir à l’aise." />
            <ol className="mt-8 space-y-7">
              {steps.map((step, index) => <li key={step.title} className="flex gap-5">
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-950/15 bg-[#f7f4e9] font-serif text-2xl text-emerald-800">{index + 1}</span>
                <div><h3 className="font-serif text-2xl text-emerald-950">{step.title}</h3><p className="mt-2 text-sm leading-7 text-emerald-950/75">{step.text}</p><p className="mt-2 text-sm font-medium text-emerald-800">{step.challenge}</p></div>
              </li>)}
            </ol>
          </div>
          <BeginnerFormulaPicker choices={[
            { label: "Je veux essayer quelques balles", title: "Un passage au practice", description: "Pour prendre vos premiers repères avec deux seaux de balles. Le cours n’est pas compris ; demandez conseil à l’accueil pour débuter.", price: buckets.values[0], unit: "les 2 seaux · extérieur", href: "#practice", action: "Voir les tarifs du practice" },
            { label: "Je veux être accompagné", title: discovery.rows[0].label, description: discovery.rows[0].values[0], price: discovery.rows[0].values[1], unit: "par personne", href: "#initiations", action: "Découvrir cette initiation" },
            { label: "Je veux aussi déjeuner sur place", title: discovery.rows[1].label, description: discovery.rows[1].values[0], price: discovery.rows[1].values[1], unit: "par personne", href: "#initiations", action: "Découvrir la journée" },
          ]} />
        </div>
      </section>
      <section id="practice" className="scroll-mt-28 bg-emerald-950">
        <div className={sectionClass}>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <SectionTitle tone="inverse" eyebrow="Le practice, c’est quoi ?" title="Un seau de balles. À vous de jouer." description="Le practice est l’espace d’entraînement : vous restez à votre poste et frappez des balles vers le terrain. Parfait pour répéter un geste et prendre confiance, sans parcourir les 9 trous." />
            <p className="rounded-2xl border border-white/20 p-5 text-sm leading-7 text-stone-100/85"><span className="font-semibold text-white">Le petit défi :</span> choisissez un repère proche et cherchez à envoyer plusieurs balles dans sa direction. La précision avant la puissance ! Gardez vos distances avec les autres joueurs et ne ramassez jamais les balles sur le terrain du practice.</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[buckets, unlimited].map((row, index) => <article key={row.label} className={`rounded-[24px] p-6 sm:p-8 ${index === 0 ? "bg-[#f7f4e9]" : "bg-[#dce9d8]"}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">{index === 0 ? "Pour un premier essai" : "Pour prendre son temps"}</p>
              <h3 className="mt-3 font-serif text-2xl text-emerald-950">{row.label}</h3>
              <dl className="mt-6 grid grid-cols-2 gap-4">{practice.columns.map((column, i) => <div key={column}><dt className="text-sm text-emerald-950/70">{column}</dt><dd className="mt-2 font-serif text-4xl text-emerald-950">{row.values[i]}</dd></div>)}</dl>
            </article>)}
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/20">
            <table className="w-full text-left text-sm text-stone-50">
              <caption className="bg-white/10 px-5 py-4 text-left font-semibold">Envie de revenir ? Les cartes de seaux</caption>
              <thead><tr className="border-y border-white/15"><th scope="col" className="px-4 py-3 font-medium sm:px-6">Carte</th>{practice.columns.map(column => <th key={column} scope="col" className="px-3 py-3 text-right font-medium sm:px-6">{column}</th>)}</tr></thead>
              <tbody>{practice.rows.slice(2).map(row => <tr key={row.label} className="border-t border-white/15"><th scope="row" className="px-4 py-4 font-normal sm:px-6">{row.label}</th>{row.values.map((value, index) => <td key={index} className="whitespace-nowrap px-3 py-4 text-right font-semibold sm:px-6">{value}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap justify-between gap-4 text-sm leading-7 text-stone-100/80"><div>{practice.footnotes?.map(note => <p key={note}>{note}</p>)}<p>Tarifs 2026 · Les seaux de balles ne comprennent pas de cours.</p></div><CTAButton href={`tel:${siteConfig.phoneHref}`} variant="secondary" className="self-start">Se renseigner à l’accueil</CTAButton></div>
        </div>
      </section>
      <section id="initiations" className={sectionClass}>
        <SectionTitle eyebrow="Un enseignant pour vous guider" title="Votre première vraie découverte du golf" description="Apprenez les premiers gestes, puis découvrez le jeu sur un parcours de 9 trous. Deux formules pour choisir le moment qui vous ressemble." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {discovery.rows.map((formula, index) => <article key={formula.label} className="flex flex-col rounded-[28px] border border-emerald-950/15 bg-white p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{index === 0 ? "Les premiers swings" : "Le plaisir se prolonge à table"}</p>
            <h3 className="mt-3 font-serif text-3xl text-emerald-950">{formula.label}</h3>
            <p className="mt-5 text-emerald-950"><span className="font-serif text-6xl">{formula.values[1]}</span><span className="ml-2 text-sm">/ personne</span></p>
            <ul className="my-7 flex-1 space-y-3 text-sm leading-7 text-emerald-950/80">{formula.values[0].split(" + ").map(item => <li key={item} className="flex gap-3"><span aria-hidden="true" className="text-emerald-700">✓</span>{item}</li>)}</ul>
            <CTAButton href="/initiation/reservation" className="self-start">{index === 0 ? "Réserver ma découverte" : "Réserver ma journée"}</CTAButton>
          </article>)}
        </div>
        <p className="mt-5 text-sm leading-7 text-emerald-950/70">Initiations proposées le week-end, selon les créneaux disponibles. Une question ou aucun créneau affiché ? Appelez-nous au <a className="font-semibold underline underline-offset-4" href={`tel:${siteConfig.phoneHref}`}>{siteConfig.phoneDisplay}</a>.</p>
      </section>
      <section className="bg-[#f7f4e9]">
        <div className={sectionClass}>
          <SectionTitle eyebrow="Le golf, sans le jargon" title="Trois mots et vous êtes dans le jeu" description="Ouvrez les cartes pour faire connaissance avec votre nouveau terrain de jeu." />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Le swing", "C’est le mouvement que vous faites avec le club pour frapper la balle. On cherche d’abord un geste équilibré, pas la force."],
              ["Le green", "C’est la zone d’herbe très courte autour du trou. Ici, on fait rouler la balle avec un club appelé putter."],
              ["Le parcours", "C’est une suite de trous à jouer. Pour chaque trou, on part d’une zone de départ et on rejoint le green en jouant sa balle."],
            ].map(([title, text], index) => <details key={title} className="rounded-2xl border border-emerald-950/15 bg-white p-6 open:bg-emerald-50"><summary className="cursor-pointer font-serif text-2xl text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4"><span className="mr-3 text-emerald-700">0{index + 1}</span>{title}</summary><p className="mt-4 text-sm leading-7 text-emerald-950/75">{text}</p></details>)}
          </div>
        </div>
      </section>
      <section id="questions" className={`${sectionClass} grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]`}>
        <div><SectionTitle eyebrow="Avant de venir" title="On répond à vos questions" /><div className="mt-7"><FAQAccordion items={beginnerFaqs} /></div></div>
        <aside className="rounded-[28px] bg-[#e8eedf] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Le sac du parfait débutant</p>
          <h2 className="mt-4 font-serif text-3xl text-emerald-950">Venez comme vous êtes.<br />Un peu préparé, quand même.</h2>
          <ul className="mt-6 space-y-3 text-sm leading-7 text-emerald-950/80">{["Une tenue confortable pour bouger.", "Des chaussures plates et stables.", "De l’eau et une tenue adaptée à la météo.", "L’envie d’essayer… et de recommencer !"].map(item => <li key={item} className="flex gap-3"><span aria-hidden="true">✓</span>{item}</li>)}</ul>
          <div className="mt-7 border-t border-emerald-950/15 pt-6"><p className="text-sm leading-7 text-emerald-950/75">Et si vous prenez goût au golf ? Retrouvez les enseignants et l’école de golf pour continuer à votre rythme.</p><div className="mt-4"><CTAButton href="/enseignement" variant="secondary">Et après l’initiation ?</CTAButton></div></div>
        </aside>
      </section>
      <section className="bg-emerald-950 text-center">
        <div className={sectionClass}><p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-200">Le prochain premier swing pourrait être le vôtre</p><h2 className="mt-4 font-serif text-4xl text-white sm:text-5xl">On se retrouve au golf ?</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-100/80">Choisissez votre initiation ou appelez l’accueil : nous vous aidons à préparer votre première visite.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><CTAButton href="/initiation/reservation" variant="secondary">Réserver une initiation</CTAButton><CTAButton href={`tel:${siteConfig.phoneHref}`} className="border border-white/40">{siteConfig.phoneDisplay}</CTAButton></div></div>
      </section>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { AssociationCalendar } from "@/components/association-calendar";
import { AssociationPortrait } from "@/components/association-portrait";

import { CTAButton } from "@/components/ui/cta-button";
import { JsonLd } from "@/components/ui/json-ld";
import { SectionTitle } from "@/components/ui/section-title";
import { associationFaqs, associationGroups, associationLicences2027, associationLinks, associationMembership, associationPartner, associationRoles } from "@/data/association";
import { associationClubChampions, associationClubChampionsHistory, associationGuepyRecord, associationPresidents, associationResults2026 } from "@/data/association-history";
import { associationNews } from "@/data/association-news";
import { associationCommissions, associationExOfficioMembers, associationOffice, associationPermanentGuests } from "@/data/association-team";
import { siteConfig } from "@/data/site";
import { buildMetadata } from "@/lib/metadata";
import { nonbreakingEuro } from "@/lib/nonbreaking-euro";
import { buildBreadcrumbSchema } from "@/lib/schema";
import { publicAssociationEvents } from "@/lib/association-events-db";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Association sportive",
  description: "Découvrez la vie associative au Golf de Marcilly : compétitions, départs, résultats, bénévolat et renseignements pour rejoindre l’AS.",
  path: "/association-sportive",
});

export default async function AssociationPage() {
  const calendar = await publicAssociationEvents();
  const currentYear = Number(new Intl.DateTimeFormat("en", { timeZone: "Europe/Paris", year: "numeric" }).format(new Date()));
  const currentNews = associationNews.filter((article) => Number(article.year) === currentYear);
  const featuredChampions = associationClubChampions.find((champions) => champions.photo);
  return (
    <>
      <JsonLd data={buildBreadcrumbSchema([
        { name: "Accueil", path: "/" },
        { name: "Association sportive", path: "/association-sportive" },
      ])} />

      <section className="bg-[#f7f4e9]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-8">
          <div>
            <SectionTitle as="h1" eyebrow="Association sportive" title="Le golf se vit aussi ensemble" description="Retrouvez les rendez-vous sportifs de Marcilly et les informations utiles pour prendre part à la vie de l’association sportive, l’AS." />
            <div className="mt-7 flex flex-wrap gap-3">
              <CTAButton href="#competitions">Les compétitions</CTAButton>
              <CTAButton href="#rejoindre" variant="secondary">Rejoindre la vie du club</CTAButton>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src="/images/parcours-accueil.webp" alt="Les greens et le plan d’eau du Golf de Marcilly" fill priority sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(100vw - 48px), 526px" className="object-cover" />
          </div>
        </div>
      </section>

      <nav aria-label="Dans cette page" className="border-y border-emerald-950/10">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-7 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
          {[
            ["#role", "Le rôle de l’AS"],
            ["#licence-2027", "Licence 2027"],
            ["#competitions", "Compétitions et résultats"],
            ["#groupes", "Équipes et seniors"],
            ["/association-sportive/equipes", "Nos équipes 2026"],
            ["#resultats-2026", "Résultats des équipes 2026"],
            ["#champions-2026", "Champions du club"],
            ["#record-guepy", "Record de Jean-Louis Guépy"],
            ["#actualites", "Actualités"],
            ["#partenaire-as", "Suivi sportif"],
            ["#equipe", "L’équipe de l’AS"],
            ["#presidents", "Présidents de l’AS"],
            ["#rejoindre", "Participer"],
          ].map(([href, label]) => {
            const className = "py-2 text-sm font-medium text-emerald-950 underline decoration-emerald-950/25 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4";
            return href.startsWith("#")
              ? <a key={href} href={href} className={className}>{label}</a>
              : <Link key={href} href={href} className={className}>{label}</Link>;
          })}
        </div>
      </nav>

      <section id="role" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <SectionTitle eyebrow="Comprendre" title="À quoi sert une association sportive de golf ?" />
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {associationRoles.map((item, index) => (
            <article key={item.title} className="border-t border-emerald-950/20 pt-5">
              <span aria-hidden="true" className="font-serif text-3xl text-emerald-700">0{index + 1}</span>
              <h3 className="mt-4 font-serif text-2xl text-emerald-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-950/75">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="licence-2027" className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-8">
        <SectionTitle eyebrow="Saison 2027" title="Licence ffgolf 2027" description="Les tarifs de la licence fédérale selon l’âge du joueur." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {associationLicences2027.map((licence) => (
            <article key={licence.category} className="flex h-full flex-col rounded-2xl border border-emerald-950/15 bg-[#f7f4e9] p-6">
              <h3 className="font-serif text-xl text-emerald-950">{licence.category}</h3>
              <p className="mt-1 text-sm text-emerald-950/70">{licence.age}</p>
              <p className="mt-auto pt-6 font-serif text-3xl font-semibold tabular-nums text-emerald-950">{nonbreakingEuro(licence.price)}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 grid overflow-hidden rounded-[28px] border border-emerald-950/15 bg-emerald-950 text-stone-50 shadow-lg shadow-emerald-950/10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="flex flex-col p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dbe9b4]">Faire vivre Marcilly ensemble</p>
            <h3 className="mt-3 font-serif text-3xl">Rejoindre l’association sportive</h3>
            <p className="mt-4 text-sm leading-7 text-stone-100/85">{associationMembership.description}</p>
            <div className="mt-auto flex flex-wrap items-end gap-x-3 gap-y-1 pt-6">
              <span className="font-serif text-4xl font-semibold tabular-nums">{nonbreakingEuro(associationMembership.price)}</span>
              <span className="pb-1 text-sm text-stone-100/85">Cotisation AS</span>
            </div>
          </div>
          <div className="bg-[#e8f4ed] p-6 text-emerald-950 sm:p-8">
            <h4 className="font-serif text-2xl">Ce que vous apporte l’AS</h4>
            <ul className="mt-5 space-y-4 text-sm leading-6">
              {associationMembership.benefits.map((benefit) => (
                <li key={benefit} className="flex gap-3"><span aria-hidden="true" className="font-bold text-emerald-700">✓</span><span>{benefit}</span></li>
              ))}
            </ul>
            <p className="mt-6 border-t border-emerald-950/15 pt-4 text-xs leading-5 text-emerald-950/70">La cotisation AS est distincte du prix de la licence ffgolf indiqué ci-dessus. Pour adhérer, contactez l’accueil.</p>
          </div>
        </div>
      </section>

      <section id="competitions" className="scroll-mt-28 bg-emerald-950 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Vos rendez-vous sportifs" tone="inverse" title="Le calendrier de l’association sportive" description="Retrouvez les compétitions, les créneaux à définir, les jours fériés, les fêtes et les vacances scolaires. Les dates et modalités des compétitions peuvent évoluer." />
          {calendar.preview2027 ? <p role="status" className="mt-6 rounded-xl border border-white/25 bg-white/10 p-4 text-sm text-white">Le programme 2027 fourni est affiché en aperçu local. Sa publication sur le site public reste à finaliser.</p> : null}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              { title: "Vérifier son départ", text: "Retrouvez les départs publiés pour les compétitions du club sur le service de la Fédération française de golf.", label: "Consulter les départs", href: associationLinks.starts },
              { title: "Retrouver les résultats", text: "Accédez aux résultats publiés des compétitions et retrouvez les classements des épreuves disputées.", label: "Voir les résultats", href: associationLinks.results },
            ].map((item) => (
              <article key={item.title} className="flex flex-col rounded-[28px] border border-white/25 bg-[#145449] p-6 shadow-lg shadow-black/10 sm:p-8">
                <h3 className="font-serif text-2xl text-stone-50">{item.title}</h3>
                <p className="mb-6 mt-3 flex-1 text-sm leading-7 text-stone-100/80">{item.text}</p>
                <CTAButton href={item.href} variant="secondary" className="self-start">{item.label}</CTAButton>
              </article>
            ))}
          </div>
          <p className="mt-8 text-sm text-stone-100/80">Le calendrier s’ouvre sur le mois en cours. Parcourez les mois avec les flèches ou choisissez un mois et une année. Pour les vacances scolaires, sélectionnez la zone A, B ou C.</p>
          {calendar.unavailable ? <p role="status" className="mt-8 rounded-2xl bg-white p-6 text-emerald-950">Le calendrier est momentanément indisponible. Réessayez dans quelques instants ou contactez l’accueil au {siteConfig.phoneDisplay}.</p> : <AssociationCalendar events={calendar.events} initialDate={new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())} />}
        </div>
      </section>

      <section id="groupes" className="scroll-mt-28 bg-[#f7f4e9] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="À chacun son parcours" title="Vivre le golf à tous les âges" description="Équipes du club et rendez-vous seniors : choisissez l’espace qui vous correspond." />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {associationGroups.map((group, index) => (
              <article key={group.title} className="flex min-h-80 flex-col rounded-[28px] border border-emerald-950/10 bg-white p-7 shadow-sm shadow-emerald-950/5 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{group.eyebrow}</p>
                  <span aria-hidden="true" className="font-serif text-3xl text-emerald-950/20">0{index + 1}</span>
                </div>
                <h2 className="mt-8 font-serif text-3xl text-emerald-950">{group.title}</h2>
                <p className="mt-4 flex-1 text-sm leading-7 text-emerald-950/75">{group.description}</p>
                <div className="mt-7"><CTAButton href={group.href} variant="ghost">{group.cta}</CTAButton></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="resultats-2026" className="scroll-mt-28 border-b border-emerald-950/10 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Saison 2026" title="Résultats des équipes de Marcilly" description="Le bilan des équipes de l’association sportive lors des championnats 2026." />
          <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {associationResults2026.map((entry) => (
              <li key={entry.team} className="flex flex-col rounded-[24px] border border-emerald-950/15 bg-[#f7f4e9] p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{entry.category}</span>
                  <span className="text-sm text-emerald-950/65">{entry.date}</span>
                </div>
                <h3 className="mt-4 font-serif text-2xl text-emerald-950">{entry.team}</h3>
                <p className="mt-2 text-sm text-emerald-950/70">Lieu : {entry.venue}</p>
                <p className="mt-5 border-t border-emerald-950/15 pt-4 text-sm font-semibold leading-6 text-emerald-950">{entry.result}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="champions-2026" className="scroll-mt-28 bg-[#f7f4e9] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Palmarès du club" title="Les champions du club" description="Retrouvez les championnes et champions du Golf de Marcilly." />
          <article className="mt-8 overflow-hidden rounded-[24px] border border-emerald-950/15 bg-white shadow-sm shadow-emerald-950/5 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            {featuredChampions?.photo ? (
              <figure className="relative aspect-[4/3] overflow-hidden bg-[#e8f4ed] lg:aspect-auto lg:min-h-80">
                <Image src={featuredChampions.photo} alt={`${featuredChampions.men} et ${featuredChampions.women}, champions du club ${featuredChampions.year}, sur le parcours de Marcilly`} fill sizes="(max-width: 1023px) 100vw, 45vw" className="object-cover object-center" />
              </figure>
            ) : null}
            <div className="grid gap-6 p-6 sm:grid-cols-2 sm:gap-0 sm:p-8 lg:items-center">
              {associationClubChampions.map((champions, index) => (
                <section key={champions.year} className={index === 0 ? "sm:pr-6" : "border-t border-emerald-950/15 pt-6 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Champions du club · {champions.year}</h3>
                  <dl className="mt-5 space-y-4">
                    <div>
                      <dt className="text-sm text-emerald-950/65">Championne</dt>
                      <dd className="mt-1 font-serif text-2xl text-emerald-950">{champions.women}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-emerald-950/65">Champion</dt>
                      <dd className="mt-1 font-serif text-2xl text-emerald-950">{champions.men}</dd>
                    </div>
                  </dl>
                </section>
              ))}
            </div>
          </article>
          <div className="mt-12">
            <h3 className="font-serif text-2xl text-emerald-950 sm:text-3xl">Le palmarès historique</h3>
            <p className="mt-2 text-sm leading-6 text-emerald-950/70">Les championnes et champions inscrits au tableau d’honneur du club-house, jusqu’en 2024.</p>
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
              {([
                { title: "Championnes", entries: associationClubChampionsHistory.women },
                { title: "Champions", entries: associationClubChampionsHistory.men },
              ] as const).map(({ title, entries }) => (
                <section key={title} className="overflow-hidden rounded-[24px] border border-emerald-950/15 bg-white shadow-sm shadow-emerald-950/5">
                  <h4 className="border-b border-emerald-950/10 bg-[#e8f4ed] px-5 py-5 font-serif text-2xl text-emerald-950 sm:px-6">{title}</h4>
                  <ul className="divide-y divide-emerald-950/10">
                    {entries.map(({ year, name }) => (
                      <li key={year} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 px-5 py-2.5 text-sm leading-6 sm:px-6 sm:text-base">
                        <span className="font-semibold tabular-nums text-emerald-800">{year}</span>
                        <span className="text-emerald-950">{name}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="record-guepy" className="scroll-mt-28 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Mémoire sportive" title="Les dix birdies de Jean-Louis Guépy" description="Un moment marquant de l’histoire de l’Open international de Marcilly." />
          <div className="mt-8 overflow-hidden rounded-[28px] border border-emerald-950/15 bg-emerald-950 text-white shadow-lg shadow-emerald-950/10 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <figure className="relative min-h-72 overflow-hidden bg-emerald-900 sm:min-h-96 lg:min-h-full">
              <Image src={associationGuepyRecord.photo} alt="Jean-Louis Guépy devant le tableau des scores de l’Open de Marcilly" fill sizes="(max-width: 1023px) 100vw, 45vw" className="object-cover" />
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-5 pt-12 text-xs text-white/90">Jean-Louis Guépy à l’Open de Marcilly · Photo : Alexis Orloff</figcaption>
            </figure>
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dbe9b4]">{associationGuepyRecord.event} · {associationGuepyRecord.date}</p>
              <p className="mt-6 font-serif text-5xl text-[#dbe9b4] sm:text-6xl">10 birdies</p>
              <p className="mt-4 max-w-2xl text-base leading-8 text-stone-100/90">Du trou n° 1 au trou n° 10, Jean-Louis Guépy a enchaîné dix birdies consécutifs le 16 mai 2004. La Ligue de golf de Nouvelle-Calédonie présente cette performance comme un record du monde.</p>
              <a href={associationGuepyRecord.source} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#dbe9b4] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">Lire la source ↗</a>
              <figure className="mt-7 overflow-hidden rounded-2xl border border-white/20 bg-white p-3">
                <Image src={associationGuepyRecord.scorecard} alt="Carte de score de Jean-Louis Guépy du 16 mai 2004, montrant les dix birdies consécutifs" width={640} height={480} sizes="(max-width: 1023px) calc(100vw - 80px), 480px" className="h-auto w-full" />
                <figcaption className="px-2 pb-1 pt-3 text-xs text-emerald-950/70">La carte de score de l’Open international de Marcilly, le 16 mai 2004.</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section id="actualites" className="scroll-mt-28 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="La vie sportive" title="Actualités de Marcilly" description="Retrouvez les actualités de l’année en cours sur les équipes du club." />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {currentNews.map((article) => (
              <article key={article.href} className="flex flex-col overflow-hidden rounded-[24px] border border-emerald-950/20 bg-[#e8f4ed] shadow-sm shadow-emerald-950/10">
                <figure>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={article.image} alt={article.imageAlt} fill sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1279px) 50vw, 390px" className="object-cover" />
                  </div>
                  <figcaption className="px-6 pt-2 text-xs text-emerald-950/60">{article.imageCaption}</figcaption>
                </figure>
                <div className="flex flex-1 flex-col p-6 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">{article.category}</p>
                  <span className="font-serif text-2xl text-emerald-950/35">{article.year}</span>
                </div>
                <h3 className="mt-5 font-serif text-2xl text-emerald-950">{article.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-emerald-950/75">{article.summary}</p>
                <a href={article.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center self-start text-sm font-semibold text-emerald-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">Lire l’article · {article.source} ↗</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="partenaire-as" className="scroll-mt-28 bg-[#f7f4e9] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Suivi sportif" title="L’outil de l’association sportive du Golf de Marcilly" description="SwingFlow accompagne le suivi des joueurs et leur progression tout au long de la saison." />
          <div className="mt-8 grid items-center gap-8 rounded-[28px] border border-emerald-950/10 bg-white p-6 shadow-sm shadow-emerald-950/5 sm:p-8 md:grid-cols-[220px_1fr]">
            <a href={associationPartner.href} target="_blank" rel="noopener noreferrer" aria-label="Découvrir SwingFlow (nouvel onglet)" className="flex min-h-40 items-center justify-center rounded-xl bg-white p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">
              <Image src={associationPartner.logo} alt="Logo de SwingFlow" width={180} height={123} sizes="180px" className="h-auto max-h-32 w-auto max-w-full object-contain" />
            </a>
            <div>
              <h2 className="font-serif text-3xl text-emerald-950">{associationPartner.name}</h2>
              <p className="mt-4 text-sm leading-7 text-emerald-950/75">{associationPartner.description}</p>
              <a href={associationPartner.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">Découvrir SwingFlow ↗</a>
            </div>
          </div>
        </div>
      </section>

      <section id="equipe" className="scroll-mt-28 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Les personnes à votre écoute" title="L’équipe de l’association sportive" />

          <div className="mt-8 rounded-[28px] bg-emerald-950 p-6 text-white sm:p-8">
            <h3 className="font-serif text-2xl sm:text-3xl">Le bureau</h3>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {associationOffice.map((person) => (
                <li key={person.role} className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-5">
                  <AssociationPortrait name={person.name} position={person.portrait} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#e6d4a2]">{person.role}</p>
                    <p className="mt-2 font-serif text-2xl">{person.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h3 className="font-serif text-2xl text-emerald-950 sm:text-3xl">Les commissions</h3>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {associationCommissions.map((person) => (
                <li key={person.role} className="flex items-center gap-4 rounded-2xl border border-emerald-950/15 bg-[#f7f4e9] p-5">
                  <AssociationPortrait name={person.name} position={person.portrait} />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">{person.role}</p>
                    <p className="mt-2 font-serif text-xl text-emerald-950">{person.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_2fr]">
            <div>
              <h3 className="font-serif text-2xl text-emerald-950 sm:text-3xl">Les membres de droit</h3>
              <ul className="mt-5 divide-y divide-emerald-950/10 rounded-2xl border border-emerald-950/15 bg-white px-5">
                {associationExOfficioMembers.map((person) => (
                  <li key={person.name} className="flex items-center gap-4 py-3 font-medium text-emerald-950">
                    <AssociationPortrait name={person.name} position={person.portrait} />
                    {person.name}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-serif text-2xl text-emerald-950 sm:text-3xl">Les invités permanents</h3>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {associationPermanentGuests.map((person) => (
                  <li key={person.name} className="flex items-center gap-4 rounded-2xl border border-emerald-950/15 bg-white px-5 py-4 font-medium text-emerald-950">
                    <AssociationPortrait name={person.name} position={person.portrait} />
                    {person.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8"><CTAButton href={`tel:${siteConfig.phoneHref}`} variant="ghost">Contacter l’accueil : {siteConfig.phoneDisplay}</CTAButton></div>
        </div>
      </section>

      <section id="presidents" className="scroll-mt-28 bg-[#f7f4e9] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Mémoire du club" title="Les présidents de l’association sportive" />
          <div className="mt-8 max-w-3xl overflow-hidden rounded-[28px] border border-emerald-950/15 bg-white shadow-sm shadow-emerald-950/5">
            <table className="w-full text-left text-sm text-emerald-950 sm:text-base">
              <caption className="sr-only">Périodes de présidence de l’association sportive du Golf de Marcilly</caption>
              <thead className="bg-emerald-950 text-white">
                <tr>
                  <th scope="col" className="w-1/3 px-4 py-4 font-semibold sm:px-6">Période</th>
                  <th scope="col" className="px-4 py-4 font-semibold sm:px-6">Président</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/10">
                {associationPresidents.map((entry) => (
                  <tr key={entry.period}>
                    <th scope="row" className="px-4 py-3 font-medium sm:px-6">{entry.period}</th>
                    <td className="px-4 py-3 sm:px-6">{entry.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="rejoindre" className="scroll-mt-28 bg-[#f7f4e9] py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionTitle eyebrow="À vous de jouer" title="Envie de participer ?" description="Adhérer, découvrir les compétitions ou donner un peu de son temps : prenez contact pour échanger sur votre envie de vous impliquer." />
            <div className="mt-6"><CTAButton href={`tel:${siteConfig.phoneHref}`}>Appeler l’accueil</CTAButton></div>
            <p className="mt-4 text-sm leading-7 text-emerald-950/75">Vous préférez écrire ? <a className="break-all underline underline-offset-4" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-emerald-950">Vos questions pratiques</h2>
            <div className="mt-4 divide-y divide-emerald-950/15">
              {associationFaqs.map((faq) => (
                <details key={faq.question} className="py-4">
                  <summary className="cursor-pointer text-sm font-semibold leading-6 text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4">{faq.question}</summary>
                  <p className="mt-3 text-sm leading-7 text-emerald-950/75">{nonbreakingEuro(faq.answer)}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

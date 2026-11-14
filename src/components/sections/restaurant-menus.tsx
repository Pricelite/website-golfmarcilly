import { CTAButton } from "@/components/ui/cta-button";
import { DrinkPackages } from "@/components/sections/drink-packages";
import { SectionTitle } from "@/components/ui/section-title";
import { restaurantData } from "@/lib/restaurant-data";
import { nonbreakingEuro } from "@/lib/nonbreaking-euro";

export function RestaurantMenus() {
  const seminar = restaurantData.seminarMenu;
  return (
      <section id="menus" className="scroll-mt-28 overflow-hidden rounded-[28px] border border-emerald-950/15 bg-white p-5 shadow-sm sm:p-8">
        <SectionTitle eyebrow="À partager à La Bergerie" title="Nos menus de groupes" description="À partir de 11 personnes. Choisissez votre formule et communiquez vos choix à l’avance pour préparer votre repas." />
        <div className="mt-8 grid items-stretch gap-6 lg:grid-cols-3">
          {restaurantData.groupMenus.items.map((menu) => (
            <article key={menu.name} className="flex min-h-64 flex-col overflow-hidden rounded-2xl border border-emerald-950/20 bg-[#e8f4ed] shadow-sm shadow-emerald-950/10">
              <div className="flex min-h-32 flex-col items-center justify-center border-b border-emerald-950/15 bg-emerald-950 px-6 py-5 text-center text-stone-50">
                <h3 className="font-serif text-2xl">{menu.name}</h3>
                <p className="mt-3"><span className="font-serif text-4xl">{nonbreakingEuro(menu.price)}</span><span className="ml-2 text-sm text-stone-100/85">/ personne</span></p>
              </div>
              <div className="flex min-h-32 flex-1 flex-col px-6 py-4 text-left">
              {menu.description ? <p className="text-sm leading-6 text-emerald-950/85">{menu.description}</p> : null}
              {menu.sections.length ? <details>
                <summary className="cursor-pointer text-sm font-semibold text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2">Voir le détail du menu</summary>
                <div className="divide-y divide-emerald-950/10">
                {menu.sections.map((section) => (
                  <div key={section.title} className="py-5">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">{section.title}</h4>
                    <ul className="mt-3 text-sm leading-7 text-emerald-950/85">
                      {section.items.map((item, index) => (
                        <li key={item}>
                          {index > 0 && section.type === "choice" ? <span className="my-2 block text-center font-serif font-bold text-emerald-800">ou</span> : null}
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                </div>
              </details> : null}
              {menu.note ? <p className="mt-auto pt-4 text-sm leading-6 text-emerald-950/75">{menu.note}</p> : null}
              </div>
            </article>
          ))}
        </div>
      <DrinkPackages />
      <section id="menu-seminaire" className="mt-8 scroll-mt-28 overflow-hidden rounded-2xl border border-emerald-950/15 bg-[#e8f4ed]">
        <div className="flex flex-wrap items-center justify-between gap-5 border-b border-emerald-950/15 bg-emerald-950 px-6 py-7 text-stone-50 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Formule Entreprises</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-50">Une journée de séminaire au golf</h2>
          </div>
          <p className="font-serif text-3xl text-stone-50">{nonbreakingEuro(seminar.price)}</p>
        </div>
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h3 className="font-serif text-2xl text-emerald-950">L’accueil et votre espace de travail</h3>
            {seminar.sections.slice(0, 2).map(section => (
              <div key={section.title} className="mt-5">
                <h4 className="text-sm font-semibold text-emerald-800">{section.title}</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-emerald-950/80">
                  {section.items.map(item => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-emerald-950/15 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <h3 className="font-serif text-2xl text-emerald-950">Un exemple de repas</h3>
            <p className="mt-2 text-sm leading-7 text-emerald-800">Le menu est à définir selon la saison.</p>
            <dl className="mt-4 space-y-4">
              {seminar.sections.slice(3).map(section => (
                <div key={section.title}>
                  <dt className="text-sm font-semibold text-emerald-800">{section.title.replace("Exemple : ", "")}</dt>
                  {section.items.map(item => <dd key={item} className="mt-1 text-sm leading-7 text-emerald-950/80">{item}</dd>)}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
      <div className="mt-8 flex flex-col items-start gap-5 border-t border-emerald-950/15 pt-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-serif text-2xl">Votre repas, un seul devis</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-emerald-950/75">Menu, boissons, séminaire ou location de salle : regroupez vos envies dans une seule demande.</p>
        </div>
        <CTAButton href="#devis-restaurant" className="shrink-0">Demander un devis global</CTAButton>
      </div>
      </section>
  );
}

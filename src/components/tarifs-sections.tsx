export default function TarifsSections() {
  return (
    <>
      <section className="mt-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
        <h2 className="font-[var(--font-display)] text-2xl text-emerald-950">
          Initiation decouverte
        </h2>
        <div className="mt-5 space-y-4 text-sm text-emerald-900/80">
          <div>
            <p className="font-semibold text-emerald-950">
              Demi-journee decouverte - 25 €
            </p>
            <p>Initiation encadree - Parcours 9 trous</p>
          </div>
          <div>
            <p className="font-semibold text-emerald-950">
              Journee decouverte - 48 €
            </p>
            <p>Initiation encadree - repas - Parcours 9 trous</p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
        <h2 className="font-[var(--font-display)] text-2xl text-emerald-950">
          Practice
        </h2>
        <p className="mt-3 text-sm text-emerald-900/70">
          Pret d&apos;un club par seau et par personne.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-emerald-900/80">
            <caption className="sr-only">Tarifs practice 2026</caption>
            <thead>
              <tr className="border-b border-emerald-900/10">
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Offre
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Exterieurs
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Abonnes
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">1 seau de balles</td>
                <td className="px-2 py-2">4 €</td>
                <td className="px-2 py-2">3 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">2 seaux de balles</td>
                <td className="px-2 py-2">6 €</td>
                <td className="px-2 py-2">5 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">5 seaux de balles</td>
                <td className="px-2 py-2">12 €</td>
                <td className="px-2 py-2">10 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">1 carte de 11 seaux</td>
                <td className="px-2 py-2">27 €</td>
                <td className="px-2 py-2">23 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">1 carte de 25 seaux</td>
                <td className="px-2 py-2">54 €</td>
                <td className="px-2 py-2">50 €</td>
              </tr>
              <tr>
                <td className="px-2 py-2">1 carte de 50 seaux</td>
                <td className="px-2 py-2">99 €</td>
                <td className="px-2 py-2">95 €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
        <h2 className="font-[var(--font-display)] text-2xl text-emerald-950">
          Green fees
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-emerald-900/80">
            <caption className="sr-only">Tarifs green fees 2026</caption>
            <thead>
              <tr className="border-b border-emerald-900/10">
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Offre
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Non licencie
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Licencie
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">9 trous decouverte ou footgolf</td>
                <td className="px-2 py-2">10 €</td>
                <td className="px-2 py-2">10 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">18 trous pitch and putt ou Kaleka</td>
                <td className="px-2 py-2">25 € (1T)</td>
                <td className="px-2 py-2">23 € (1T)</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">Jeunes -20 ans</td>
                <td className="px-2 py-2">20 €</td>
                <td className="px-2 py-2">18 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">9 trous grand parcours</td>
                <td className="px-2 py-2">44 € (4T)</td>
                <td className="px-2 py-2">39 € (3T)</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">Jeunes -20 ans</td>
                <td className="px-2 py-2">30 €</td>
                <td className="px-2 py-2">25 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">18 trous grand parcours</td>
                <td className="px-2 py-2">64 € (6T)</td>
                <td className="px-2 py-2">59 € (5T)</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">Jeunes -20 ans</td>
                <td className="px-2 py-2">40 €</td>
                <td className="px-2 py-2">30 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">18 trous apres 16h00</td>
                <td className="px-2 py-2">44 € (4T)</td>
                <td className="px-2 py-2">39 € (3T)</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">
                  Carnet 10 tickets dematerialise (Pitch et Kaleka)
                </td>
                <td className="px-2 py-2">200 €</td>
                <td className="px-2 py-2">200 €</td>
              </tr>
              <tr>
                <td className="px-2 py-2">
                  Carnet 30 tickets dematerialise (Grand Parcours)
                </td>
                <td className="px-2 py-2">300 €</td>
                <td className="px-2 py-2">300 €</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-emerald-900/70">Valable 6 mois.</p>
      </section>

      <section className="mt-8 rounded-[32px] border border-emerald-900/10 bg-white/80 p-8 shadow-xl shadow-emerald-900/10 backdrop-blur">
        <h2 className="font-[var(--font-display)] text-2xl text-emerald-950">
          Location
        </h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-emerald-900/80">
            <caption className="sr-only">Tarifs location 2026</caption>
            <thead>
              <tr className="border-b border-emerald-900/10">
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Offre
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Exterieurs
                </th>
                <th className="px-2 py-2 font-semibold text-emerald-950">
                  Abonnes
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">Chariot</td>
                <td className="px-2 py-2">5 €</td>
                <td className="px-2 py-2">5 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">Voiturette 9 trous</td>
                <td className="px-2 py-2">28 €</td>
                <td className="px-2 py-2">24 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">Voiturette 18 trous</td>
                <td className="px-2 py-2">38 €</td>
                <td className="px-2 py-2">32 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">Carnet de 11 voiturettes</td>
                <td className="px-2 py-2">380 €</td>
                <td className="px-2 py-2">320 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">Casier a l&apos;annee</td>
                <td className="px-2 py-2">48 €</td>
                <td className="px-2 py-2">48 €</td>
              </tr>
              <tr className="border-b border-emerald-900/10">
                <td className="px-2 py-2">Local chariot a l&apos;annee (manuel)</td>
                <td className="px-2 py-2">84 €</td>
                <td className="px-2 py-2">84 €</td>
              </tr>
              <tr>
                <td className="px-2 py-2">
                  Local chariot a l&apos;annee (electrique)
                </td>
                <td className="px-2 py-2">96 €</td>
                <td className="px-2 py-2">96 €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

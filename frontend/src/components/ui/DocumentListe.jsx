import { createPortal } from 'react-dom'

/**
 * DocumentListe — tableau destiné au papier (A4), rendu dans #print-area.
 *
 * Il ne reprend pas la mise en page de l'application : titre, en-tête
 * d'informations, tableau bordé et éventuel pied de page. L'impression
 * n'imprime donc que la liste, jamais la page web autour.
 *
 * @param {HTMLElement|null} zone       cible du portail (usePrintArea)
 * @param {string} titre                titre du document
 * @param {string} [sousTitre]
 * @param {string[]} [meta]             lignes d'en-tête (période, matricule, date d'édition…)
 * @param {Array<{label: string, cle?: string, valeur?: (ligne: any) => any, align?: 'left'|'right'}>} colonnes
 * @param {any[]} lignes
 * @param {string} [piedDePage]         récapitulatif imprimé sous le tableau
 */
export default function DocumentListe({
  zone,
  titre,
  sousTitre,
  meta = [],
  colonnes = [],
  lignes = [],
  piedDePage,
}) {
  if (!zone) return null

  return createPortal(
    <article className="document-liste mx-auto w-full max-w-[860px] border border-slate-300 bg-white p-6 text-[12px] leading-5 text-slate-900 print:p-0">
      <header className="mb-4 border-b-2 border-slate-800 pb-3">
        <h1 className="text-[18px] font-bold leading-6">{titre}</h1>
        {sousTitre && <p className="mt-0.5">{sousTitre}</p>}
        {meta.filter(Boolean).length > 0 && (
          <div
            className="mt-2 grid gap-x-6 gap-y-0.5 text-[11px]"
            style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
          >
            {meta.filter(Boolean).map((ligne, i) => (
              <p key={`${ligne}-${i}`}>{ligne}</p>
            ))}
          </div>
        )}
      </header>

      <table className="w-full border-collapse border border-slate-700 text-[11px]">
        <thead>
          <tr className="border-b border-slate-700 bg-slate-100">
            {colonnes.map((colonne) => (
              <th
                key={colonne.label}
                scope="col"
                className={`border-l border-slate-700 px-2 py-1.5 font-semibold first:border-l-0 ${
                  colonne.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {colonne.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne, index) => (
            <tr key={ligne.id ?? index} className="border-b border-slate-300">
              {colonnes.map((colonne) => {
                const valeur = colonne.valeur
                  ? colonne.valeur(ligne)
                  : ligne[colonne.cle]
                const texte =
                  valeur === null || valeur === undefined || valeur === ''
                    ? '—'
                    : valeur

                return (
                  <td
                    key={colonne.label}
                    className={`border-l border-slate-300 px-2 py-1.5 first:border-l-0 ${
                      colonne.align === 'right' ? 'text-right tabular-nums' : ''
                    }`}
                  >
                    {texte}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {piedDePage && <p className="mt-3 text-[11px] text-slate-700">{piedDePage}</p>}
    </article>,
    zone,
  )
}

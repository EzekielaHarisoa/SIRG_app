import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatMontant } from '../../utils/format.js'
import { getFichePaie } from '../../services/bulletinPaieService.js'
import { usePrintArea } from '../../hooks/usePrintArea.js'
import Button from '../ui/Button.jsx'
import LoadingState from '../ui/LoadingState.jsx'
import ErrorState from '../ui/ErrorState.jsx'

const BTN_SECONDARY = '!rounded-none !border-slate-300 !text-slate-800 hover:!bg-slate-50'
const BTN_LINK = '!rounded-none !font-medium !text-[#005EB8] hover:!bg-slate-50'

const POURCENT = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const nombre = (valeur) => {
  const n = Number(valeur)
  return valeur === null || valeur === undefined || !Number.isFinite(n) ? null : n
}
const montant = (valeur) => (nombre(valeur) === null ? '' : formatMontant(valeur))
const taux = (valeur) => (nombre(valeur) === null ? '' : POURCENT.format(Number(valeur)))

/** Date ISO (AAAA-MM-JJ) → JJ/MM/AAAA. */
function dateFr(iso) {
  if (!iso) return ''
  const [a, m, j] = String(iso).slice(0, 10).split('-')
  return a && m && j ? `${j}/${m}/${a}` : String(iso)
}

/**
 * Fiche de paie papier (A4). Rendu deux fois : à l'écran et, via un portail,
 * dans la zone d'impression — ce qui évite d'imprimer la page web autour.
 */
function FichePaieDocument({ fiche }) {
  const entreprise = fiche.entreprise ?? {}
  const employe = fiche.employe ?? {}
  const periode = fiche.periode ?? {}
  const lignes = fiche.lignes ?? []

  return (
    <article className="fiche-paie mx-auto w-full max-w-[860px] border border-slate-300 bg-white p-6 text-[12px] leading-5 text-slate-900 sm:p-8">
      {/* En-tête : employeur + titre */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-sm border-2 border-slate-400 p-3">
          <p className="text-[13px] font-bold">{entreprise.nom || '—'}</p>
          {(entreprise.adresse || '').split('\n').filter(Boolean).map((ligne) => (
            <p key={ligne} className="mt-0.5">{ligne}</p>
          ))}
          <div className="mt-1 space-y-0.5">
            <p>
              <span className="font-semibold">Siret :</span> {entreprise.siret || '—'}
              <span className="ml-3 font-semibold">Code NAF :</span> {entreprise.codeNaf || '—'}
            </p>
            <p>
              <span className="font-semibold">Urssaf :</span> {entreprise.matriculeUrssaf || '—'}
            </p>
            <p>
              <span className="font-semibold">Convention :</span> {entreprise.convention || '—'}
            </p>
          </div>
        </div>

        <div className="sm:pl-2">
          <h3 className="text-[28px] font-bold leading-8 tracking-tight">Fiche de paie</h3>
          <div className="mt-4 space-y-0.5">
            <p>
              <span className="font-semibold">Période du :</span> {dateFr(periode.debut)}
              <span className="ml-2 font-semibold">au :</span> {dateFr(periode.fin)}
            </p>
            <p>
              <span className="font-semibold">Paiement le :</span> {dateFr(periode.paiementLe)}
            </p>
          </div>
        </div>
      </div>

      {/* Identité du salarié */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="text-[11px] leading-4">
          <p><span className="font-semibold">Matricule :</span> {employe.matricule ?? '—'}</p>
          <p><span className="font-semibold">N° Sécurité Sociale :</span> {employe.numeroSecuriteSociale || '—'}</p>
          <p><span className="font-semibold">Entrée le :</span> {dateFr(employe.entreeLe) || '—'}</p>
          <p><span className="font-semibold">Emploi :</span> {employe.emploi || '—'}</p>
          <p><span className="font-semibold">Qualification :</span> {employe.qualification || '—'}</p>
          <p><span className="font-semibold">Coefficient :</span> {employe.coefficient ?? '—'}</p>
          <p><span className="font-semibold">Plafond Sécurité Sociale :</span> {montant(employe.plafondSecuriteSociale)}</p>
          <p><span className="font-semibold">Contrat :</span> {employe.typeContrat || '—'}</p>
        </div>
        <div className="sm:pl-2">
          <p className="text-[15px] font-bold">{employe.nomComplet || '—'}</p>
          {(employe.adresse || '').split('\n').filter(Boolean).map((ligne) => (
            <p key={ligne}>{ligne}</p>
          ))}
        </div>
      </div>

      {/* Tableau des rubriques */}
      <div className="mt-6">
        <table className="w-full table-fixed border-collapse border border-slate-800 text-[11px]">
          <thead>
            <tr className="border-b border-slate-800 font-bold">
              <th scope="col" className="w-[34%] px-2 py-1 text-center">Rubriques</th>
              <th scope="col" className="w-[13%] border-l border-slate-800 px-1 py-1 text-center">Base</th>
              <th scope="col" className="w-[12%] border-l border-slate-800 px-1 py-1 text-center">Taux salarial</th>
              <th scope="col" className="w-[14%] border-l border-slate-800 px-1 py-1 text-center">Cot. salariales</th>
              <th scope="col" className="w-[13%] border-l border-slate-800 px-1 py-1 text-center">Taux patronal</th>
              <th scope="col" className="w-[14%] border-l border-slate-800 px-1 py-1 text-center">Cot. patronales</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne, i) => (
              <tr
                key={`${ligne.libelle}-${i}`}
                className={ligne.estSection ? 'font-bold' : ''}
              >
                <td className={`px-2 ${ligne.estSection ? 'py-3' : 'py-1.5'}`}>{ligne.libelle}</td>
                <td className="border-l border-slate-800 px-1 text-right tabular-nums">{montant(ligne.base)}</td>
                <td className="border-l border-slate-800 px-1 text-right tabular-nums">{taux(ligne.tauxSalarial)}</td>
                <td className="border-l border-slate-800 px-1 text-right tabular-nums">{montant(ligne.cotisationSalariale)}</td>
                <td className="border-l border-slate-800 px-1 text-right tabular-nums">{taux(ligne.tauxPatronal)}</td>
                <td className="border-l border-slate-800 px-1 text-right tabular-nums">{montant(ligne.cotisationPatronale)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-800 font-bold">
              <td className="px-2 py-2">TOTAL</td>
              <td className="border-l border-slate-800 px-1" />
              <td className="border-l border-slate-800 px-1" />
              <td className="border-l border-slate-800 px-1 py-2 text-right tabular-nums">
                {montant(fiche.totalCotisationsSalariales)}
              </td>
              <td className="border-l border-slate-800 px-1" />
              <td className="border-l border-slate-800 px-1 py-2 text-right tabular-nums">
                {montant(fiche.totalCotisationsPatronales)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Totaux */}
      <div className="mt-5 flex justify-end">
        <table className="w-full max-w-sm border-collapse border border-slate-800 text-[12px]">
          <tbody>
            <tr className="border-b border-slate-800">
              <th scope="row" className="px-3 py-2 text-left font-normal">Salaire brut</th>
              <td className="border-l border-slate-800 px-3 py-2 text-right tabular-nums">
                {formatMontant(fiche.salaireBrut)}
              </td>
            </tr>
            <tr className="border-b border-slate-800">
              <th scope="row" className="px-3 py-2 text-left text-[13px] font-bold">Salaire net à payer</th>
              <td className="border-l border-slate-800 px-3 py-2 text-right text-[14px] font-bold tabular-nums">
                {formatMontant(fiche.salaireNet)}
              </td>
            </tr>
            <tr>
              <th scope="row" className="px-3 py-2 text-left font-normal">Coût global employeur</th>
              <td className="border-l border-slate-800 px-3 py-2 text-right tabular-nums">
                {formatMontant(fiche.coutGlobal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  )
}

/**
 * BulletinDetailPage — fiche de paie détaillée chargée depuis
 * GET /api/bulletins/{id}/fiche, présentée comme une fiche papier (A4).
 *
 * L'impression n'imprime que la fiche : une copie est rendue dans #print-area
 * et, tant qu'elle existe, body.printing-document masque le reste de l'interface.
 */
export default function BulletinDetailPage({ bulletinId, onPrint, onClose }) {
  const [fiche, setFiche] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // La classe d'impression n'est posée que lorsqu'une fiche est réellement affichée.
  const printArea = usePrintArea(Boolean(fiche))

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    getFichePaie(bulletinId)
      .then((data) => {
        if (!mounted) return
        setFiche(data)
        setLoading(false)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err)
        setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [bulletinId])

  if (loading) return <LoadingState label="Chargement de la fiche de paie…" />
  if (error) return <ErrorState error={error} onRetry={onClose} />
  if (!fiche) return <ErrorState error={{ message: 'Fiche introuvable.' }} onRetry={onClose} />

  return (
    <>
      {printArea && createPortal(<FichePaieDocument fiche={fiche} />, printArea)}

      <div className="antialiased">
        <div className="mb-3 flex items-center justify-end gap-2 print:hidden">
          <Button variant="secondary" size="sm" className={BTN_SECONDARY} onClick={() => onPrint?.(fiche)}>
            Imprimer / PDF
          </Button>
          <Button variant="ghost" size="sm" className={BTN_LINK} onClick={onClose}>
            Fermer
          </Button>
        </div>

        <FichePaieDocument fiche={fiche} />
      </div>
    </>
  )
}

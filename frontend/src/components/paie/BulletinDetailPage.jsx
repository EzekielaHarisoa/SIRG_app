import { useEffect, useState } from 'react'
import { formatCell, formatMontant, monthLabel, formatDate } from '../../utils/format.js'
import { getBulletinById, getTotalPrimes, getSalaireBrut } from '../../services/bulletinPaieService.js'
import { BULLETIN_FIELDS as F } from '../../config/contracts.js'
import Button from '../ui/Button.jsx'
import LoadingState from '../ui/LoadingState.jsx'
import ErrorState from '../ui/ErrorState.jsx'
import { ApiError } from '../../services/api.js'

/**
 * BulletinDetailPage — vue détaillée d'un bulletin de paie, chargée depuis
 * l'API réelle. Prête pour impression A4 (fond blanc, sans navigation).
 */
export default function BulletinDetailPage({ bulletinId, onPrint, onClose }) {
  const [bulletin, setBulletin] = useState(null)
  const [totalPrimes, setTotalPrimes] = useState(null)
  const [salaireBrut, setSalaireBrut] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    Promise.all([
      getBulletinById(bulletinId).catch((e) => Promise.reject(e)),
      getTotalPrimes(bulletinId).catch((e) =>
        e instanceof ApiError && e.status === 404 ? null : Promise.reject(e),
      ),
      getSalaireBrut(bulletinId).catch((e) =>
        e instanceof ApiError && e.status === 404 ? null : Promise.reject(e),
      ),
    ])
      .then(([b, primes, brut]) => {
        if (!mounted) return
        setBulletin(b)
        setTotalPrimes(primes)
        setSalaireBrut(brut)
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

  const close = () => {
    setLoading(false)
    setError(null)
    onClose?.()
  }

  const handlePrint = () => {
    if (!bulletin) return
    onPrint?.(bulletin)
  }

  if (loading) return <LoadingState label="Chargement du bulletin…" />
  if (error) return <ErrorState error={error} onRetry={onClose} />
  if (!bulletin) return <ErrorState error={{ message: 'Bulletin introuvable.' }} onRetry={onClose} />

  const primeTotal =
    totalPrimes != null ? Number(totalPrimes) : Number(bulletin.totalPrimes ?? 0)

  const rows = [
    { label: 'Matricule', value: formatCell(bulletin[F.numeroMatricule]) },
    { label: 'Mois', value: monthLabel(bulletin[F.mois]) },
    { label: 'Année', value: formatCell(bulletin[F.anne]) },
    { label: 'Date d\'émission', value: formatDate(bulletin.dateEmission) },
    { label: 'Salaire de base', value: formatMontant(bulletin.salaireDeBase) },
    { label: 'Heures travaillées', value: formatMontant(bulletin.heurTravaille) },
    { label: 'Congés restants', value: formatMontant(bulletin.congeRestant) },
    {
      label: 'Total des primes',
      value: formatMontant(primeTotal),
      accent: true,
    },
    {
      label: 'Salaire brut',
      value: salaireBrut != null ? formatMontant(salaireBrut) : formatMontant(bulletin[F.salaireBrut]),
    },
    { label: 'Base IRSA', value: formatMontant(bulletin.baseIrsa) },
    { label: 'IRSA', value: formatMontant(bulletin.irsa) },
    { label: 'Salaire net à payer', value: formatMontant(bulletin.salaireNet), accent: true },
    { label: 'Charges patronales', value: formatMontant(bulletin.chargePatronal) },
    { label: 'Coût global', value: formatMontant(bulletin.coutGlobale) },
  ]

  return (
    <div className="print:bg-white print:p-0">
      <div className="print:hidden print:flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={handlePrint}>
          Imprimer / PDF
        </Button>
        <Button variant="ghost" size="sm" onClick={close}>
          Fermer
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.label}>
                <th
                  scope="row"
                  className={`bg-slate-50 px-4 py-3 text-left font-medium text-slate-600 ${
                    r.accent ? 'text-blue-700' : ''
                  }`}
                >
                  {r.label}
                </th>
                <td className={`px-4 py-3 text-slate-800 ${r.accent ? 'font-semibold' : ''}`}>
                  {r.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 print:text-xs print:text-slate-400">
        <p className="font-medium text-slate-600 print:font-medium">Notes de calcul (données servies par le backend)</p>
        <ul className="mt-1 list-disc pl-4">
          <li>Salaire brut = salaire de base + heures travaillées + total des primes.</li>
          <li>Base IRSA = salaire brut − 2 % de charges salariales.</li>
          <li>IRSA = taux progressif sur la base IRSA (déterminé côté backend).</li>
          <li>Salaire net à payer = salaire brut − charges salariales − IRSA.</li>
          <li>Charges patronales = 19 % du salaire brut.</li>
          <li>Coût global = salaire brut + charges patronales.</li>
        </ul>
      </div>
    </div>
  )
}

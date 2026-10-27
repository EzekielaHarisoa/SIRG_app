import { useEffect, useState } from 'react'
import { formatCell, formatMontant, monthLabel } from '../../utils/format.js'
import { getBulletinById, getTotalPrimes, getSalaireBrut } from '../../services/bulletinPaieService.js'
import { BULLETIN_FIELDS as F } from '../../config/contracts.js'
import Button from '../ui/Button.jsx'
import LoadingState from '../ui/LoadingState.jsx'
import ErrorState from '../ui/ErrorState.jsx'
import { ApiError } from '../../services/api.js'

/**
 * BulletinDetailPage — detail view for a payslip, loaded from the real API.
 * Not a standalone route; meant to be embedded (e.g. in a modal or section).
 */
export default function BulletinDetailPage({ bulletinId, onPrint }) {
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

  if (loading) return <LoadingState label="Chargement du bulletin…" />
  if (error) return <ErrorState error={error} />
  if (!bulletin) return <ErrorState error={{ message: 'Bulletin introuvable.' }} />

  const rows = [
    { label: 'Matricule', value: formatCell(bulletin[F.numeroMatricule]) },
    { label: 'Mois', value: monthLabel(bulletin[F.mois]) },
    { label: 'Année', value: formatCell(bulletin[F.anne]) },
    { label: 'Salaire de base', value: formatMontant(bulletin[F.salaireBase]) },
    {
      label: 'Salaire brut',
      value: salaireBrut != null ? formatMontant(salaireBrut) : formatMontant(bulletin[F.salaireBrut]),
    },
    {
      label: 'Total des primes',
      value: totalPrimes != null ? formatMontant(totalPrimes) : formatMontant(bulletin[F.totalPrimes]),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                  {r.label}
                </th>
                <td className="px-4 py-3 text-slate-800">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => onPrint?.(bulletin)}>
          Imprimer
        </Button>
      </div>
    </div>
  )
}

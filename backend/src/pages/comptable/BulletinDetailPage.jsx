import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBulletinById, getTotalPrimes, getSalaireBrut } from '../../services/bulletinPaieService.js'
import { formatMontant, formatCell } from '../../utils/format.js'
import Button from '../ui/Button.jsx'
import LoadingState from '../ui/LoadingState.jsx'
import ErrorState from '../ui/ErrorState.jsx'
import { ApiError } from '../services/api.js'

export default function BulletinDetailPage() {
  const { id } = useParams()
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
      getBulletinById(id).catch((e) => Promise.reject(e)),
      getTotalPrimes(id).catch((e) =>
        e instanceof ApiError && e.status === 404 ? null : Promise.reject(e),
      ),
      getSalaireBrut(id).catch((e) =>
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
  }, [id])

  if (loading) return <LoadingState label="Chargement du bulletin…" />
  if (error) return <ErrorState error={error} />
  if (!bulletin) return <ErrorState error={{ message: 'Bulletin introuvable.' }} />

  return (
    <div>
      <Link to="/comptable/bulletins" className="text-sm text-blue-600 hover:underline">
        ← Retour à la liste
      </Link>

      <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <tbody className="divide-y divide-slate-100">
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Matricule
              </th>
              <td className="px-4 py-3 text-slate-800">{formatCell(bulletin.numeroMatricule)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Date émission
              </th>
              <td className="px-4 py-3 text-slate-800">{formatCell(bulletin.dateEmission)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Salaire de base
              </th>
              <td className="px-4 py-3 text-slate-800">{formatMontant(bulletin.salaireDeBase)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Salaire brut
              </th>
              <td className="px-4 py-3 text-slate-800">{formatMontant(salaireBrut ?? bulletin.salaireBrute)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Total primes
              </th>
              <td className="px-4 py-3 text-slate-800">{formatMontant(totalPrimes ?? bulletin.totalPrime)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Base IRSA
              </th>
              <td className="px-4 py-3 text-slate-800">{formatMontant(bulletin.baseIrsa)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                IRSA
              </th>
              <td className="px-4 py-3 text-slate-800">{formatMontant(bulletin.irsa)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Salaire net
              </th>
              <td className="px-4 py-3 text-slate-800">{formatMontant(bulletin.salaireNet)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Charges patronales
              </th>
              <td className="px-4 py-3 text-slate-800">{formatMontant(bulletin.chargePatronal)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Coût global
              </th>
              <td className="px-4 py-3 text-slate-800">{formatMontant(bulletin.coutGlobale)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Heures travaillées
              </th>
              <td className="px-4 py-3 text-slate-800">{formatMontant(bulletin.heurTravaille)}</td>
            </tr>
            <tr>
              <th scope="row" className="bg-slate-50 px-4 py-3 text-left font-medium text-slate-600">
                Congés restants
              </th>
              <td className="px-4 py-3 text-slate-800">{formatMontant(bulletin.congeRestant)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="primary">Imprimer</Button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import FormField from '../../components/ui/FormField.jsx'
import Button from '../../components/ui/Button.jsx'
import { getSoldeByMatricule } from '../../services/soldeCongeService.js'
import { ApiError } from '../../services/api.js'
import { formatCell } from '../../utils/format.js'
import { SOLDE_CONGE_FIELDS as F } from '../../config/contracts.js'

export default function EmployeDashboard() {
  const { user, isPreview } = useAuth()
  const [matricule, setMatricule] = useState('')
  const [solde, setSolde] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadSolde = async (e) => {
    e?.preventDefault()
    if (!matricule) return
    setLoading(true)
    setError(null)
    try {
      const data = await getSoldeByMatricule(matricule)
      setSolde(data)
    } catch (err) {
      setError(err)
      setSolde(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Bienvenue dans votre espace employé."
      />

      {isPreview && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Vous êtes en mode prévisualisation. Aucune identité réelle n'est associée à cette session.
        </div>
      )}

      <div className="rounded-md border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-700">Votre matricule</h2>
        <p className="mt-1 text-xs text-slate-500">
          Lidentité employé nétant pas vérifiée par le backend, indiquez votre matricule pour
          consulter vos informations personnelles.
        </p>
        <form onSubmit={loadSolde} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <FormField
              label="Matricule"
              name="matricule"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="Ex : 1001"
            />
          </div>
          <Button type="submit" variant="primary" loading={loading}>
            Consulter mon solde
          </Button>
        </form>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error instanceof ApiError && error.status === 0
            ? 'Backend injoignable. Vérifiez que le serveur Spring Boot est démarré.'
            : error.message || String(error)}
        </div>
      )}

      {solde && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Solde annuel" value={solde[F.soldeAnnuel]} />
          <StatCard label="Solde maladie" value={solde[F.soldeMaladie]} />
          <StatCard label="Jours pris" value={solde[F.joursPris]} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Utilisateur connecté" value={user?.nom || user?.login || '—'} />
        <StatCard label="Rôle" value={user?.role || '—'} formatter={formatCell} />
      </div>
    </div>
  )
}

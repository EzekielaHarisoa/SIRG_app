import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getAllBulletins } from '../../services/bulletinPaieService.js'

export default function ComptableDashboard() {
  const { user } = useAuth()
  const { data, error } = useApi(() => getAllBulletins().catch(() => null), [])

  const count = Array.isArray(data) ? data.length : '—'

  return (
    <div>
      <PageHeader title="Tableau de bord comptable" description="Vue densemble des bulletins de paie." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Bulletins" value={count} hint={error ? 'Backend injoignable' : undefined} />
      </div>

      <div className="mt-6 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Connecté en tant que <strong>{user?.nom || user?.login}</strong>.
      </div>
    </div>
  )
}

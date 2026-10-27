import PageHeader from '../../components/ui/PageHeader.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getAllEmployes } from '../../services/employeService.js'
import { getAllPointages } from '../../services/pointageService.js'
import { getAllDemandes } from '../../services/demandeCongeService.js'

export default function RHDashboard() {
  const { user } = useAuth()
  const employes = useApi(() => getAllEmployes().catch(() => null), [])
  const pointages = useApi(() => getAllPointages().catch(() => null), [])
  const demandes = useApi(() => getAllDemandes().catch(() => null), [])

  const count = (r) => (Array.isArray(r) ? r.length : '—')

  return (
    <div>
      <PageHeader
        title="Tableau de bord RH"
        description="Vue densemble des ressources humaines."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Employés" value={count(employes.data)} hint={employes.error ? 'Backend injoignable' : undefined} />
        <StatCard label="Pointages" value={count(pointages.data)} hint={pointages.error ? 'Backend injoignable' : undefined} />
        <StatCard label="Demandes de congé" value={count(demandes.data)} hint={demandes.error ? 'Backend injoignable' : undefined} />
      </div>

      <div className="mt-6 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Connecté en tant que <strong>{user?.nom || user?.login}</strong>.
      </div>
    </div>
  )
}

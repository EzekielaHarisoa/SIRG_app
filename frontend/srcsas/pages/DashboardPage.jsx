import { Users, Clock, CalendarDays, Wallet, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { employeService } from '../services/employeService'
import { bulletinPaieService } from '../services/bulletinPaieService'
import { pointageService } from '../services/pointageService'
import { demandeCongeService } from '../services/demandeCongeService'
import LoadingState from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'

/**
 * Dashboard.
 *
 * Indicator values come only from real API responses. If an endpoint is
 * unreachable, the card shows a neutral placeholder — never a fabricated number.
 */
export default function DashboardPage() {
  const employes = useApi(() => employeService.list(), [])
  const bulletins = useApi(() => bulletinPaieService.list(), [])
  const pointages = useApi(() => pointageService.list(), [])
  const demandes = useApi(() => demandeCongeService.list(), [])

  const anyLoading = employes.loading || bulletins.loading || pointages.loading || demandes.loading
  const anyError = employes.error || bulletins.error || pointages.error || demandes.error

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900">Tableau de bord</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Vue d'ensemble des ressources humaines. Les indicateurs sont alimentés
          par les API disponibles.
        </p>
      </div>

      {anyLoading && <LoadingState message="Chargement des indicateurs…" />}

      {anyError && (
        <ErrorState
          title="Indicateurs partiellement indisponibles"
          message="Certaines données n'ont pas pu être chargées depuis le backend. Vérifiez que le backend est démarré et que CORS est configuré."
          onRetry={() => { employes.refetch(); bulletins.refetch(); pointages.refetch(); demandes.refetch() }}
        />
      )}

      {!anyLoading && !anyError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Employés"
            value={Array.isArray(employes.data) ? employes.data.length : null}
            to="/employes"
          />
          <StatCard
            icon={Clock}
            label="Pointages"
            value={Array.isArray(pointages.data) ? pointages.data.length : null}
            to="/pointages"
          />
          <StatCard
            icon={CalendarDays}
            label="Demandes de congé"
            value={Array.isArray(demandes.data) ? demandes.data.length : null}
            to="/demandes-conge"
          />
          <StatCard
            icon={FileText}
            label="Bulletins de paie"
            value={Array.isArray(bulletins.data) ? bulletins.data.length : null}
            to="/bulletins-paie"
          />
        </div>
      )}

      {!anyLoading && !anyError && (
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-neutral-700">Soldes de congé</h3>
          <p className="mt-2 text-sm text-neutral-500">
            Les soldes de congé sont consultables par employé sur la page dédiée.
          </p>
          <Link
            to="/soldes-conge"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <Wallet className="h-4 w-4" />
            Consulter les soldes
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-primary-300 hover:shadow-sm"
    >
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-primary-50 text-primary-600">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-neutral-500">{label}</p>
        {value === null ? (
          <p className="mt-0.5 text-sm font-medium text-neutral-400">—</p>
        ) : (
          <p className="mt-0.5 text-2xl font-semibold text-neutral-900">{value}</p>
        )}
      </div>
    </Link>
  )
}

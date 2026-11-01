import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getSoldeGlobal } from '../../services/soldeCongeService.js'

const NOMBRE = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

function jours(valeur) {
  if (valeur === null || valeur === undefined || Number.isNaN(Number(valeur))) return '—'
  return NOMBRE.format(Number(valeur))
}

function Metric({ label, value, suffix }) {
  return (
    <div className="px-4 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
        {value}
        {suffix && <span className="ml-1 text-sm font-normal text-slate-500">{suffix}</span>}
      </p>
    </div>
  )
}

export default function EmployeDashboard() {
  const { user } = useAuth()
  const matricule = user?.numeroMatricule ?? null

  const { data, error, loading, refetch } = useApi(
    () => (matricule ? getSoldeGlobal(matricule) : Promise.resolve(null)),
    [matricule],
  )

  return (
    <div className="space-y-6">
      <PageHeader title="Tableau de bord" description="Bienvenue dans votre espace employé." />

      <section className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {user?.nomEtPrenoms || user?.login || 'Utilisateur'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {matricule ? `Matricule ${matricule}` : 'Matricule indisponible'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/employe/conges"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Mes congés
          </Link>
          <Link
            to="/employe/solde"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Mon solde
          </Link>
        </div>
      </section>

      {!matricule ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Votre profil ne contient pas de numéro matricule : vos informations personnelles sont
          indisponibles. Contactez le service RH pour rattacher votre compte à un employé.
        </div>
      ) : loading ? (
        <LoadingState label="Chargement de votre solde…" />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Congés</h2>
            <Link to="/employe/solde" className="text-xs font-medium text-blue-700 hover:underline">
              Voir le détail des tranches
            </Link>
          </div>
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Metric label="Jours restants" value={jours(data?.totalJoursRestants)} suffix="jours" />
            <Metric label="Jours acquis" value={jours(data?.totalJoursAcquis)} suffix="jours" />
            <Metric label="Jours consommés" value={jours(data?.totalJoursConsommes)} suffix="jours" />
          </div>
        </section>
      )}
    </div>
  )
}

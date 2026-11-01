import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import IdentityStrip from '../../components/ui/IdentityStrip.jsx'
import Button from '../../components/ui/Button.jsx'
import SoldeCongesPanel from '../../components/conges/SoldeCongesPanel.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getSoldeGlobal } from '../../services/soldeCongeService.js'

const REGLES = [
  '2,5 jours acquis par mois travaillé.',
  'Deux tranches de 15 jours ouvertes à chaque anniversaire d’embauche.',
  'La première tranche est consommée en priorité et expire après 3 mois.',
  'La deuxième tranche reste valable 3 ans.',
  'Les congés payés ne sont disponibles qu’après le premier anniversaire d’embauche.',
]

export default function MonSoldePage() {
  const { user } = useAuth()
  const matricule = user?.numeroMatricule ?? null

  const { data, error, loading, refetch } = useApi(
    () => (matricule ? getSoldeGlobal(matricule) : Promise.resolve(null)),
    [matricule],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon solde de congé"
        description="Solde calculé par le serveur à partir de vos tranches et de vos consommations."
        actions={
          <Button variant="secondary" onClick={refetch} loading={loading}>
            Actualiser
          </Button>
        }
      />

      <IdentityStrip
        title={user?.nomEtPrenoms || user?.login || 'Utilisateur'}
        meta={matricule ? `Matricule ${matricule}` : 'Matricule indisponible'}
        aside={
          <span className="text-xs tabular-nums text-slate-500">
            {loading ? 'Mise à jour…' : 'À jour'}
          </span>
        }
      />

      {!matricule ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Votre profil ne contient pas de numéro matricule : le solde est indisponible. Contactez le
          service RH pour rattacher votre compte à un employé.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SoldeCongesPanel
              solde={data}
              loading={loading}
              error={error}
              title="Solde global"
              description="Agrégat de vos tranches, actives comme expirées."
            />
          </div>

          <div className="lg:col-span-2">
            <section className="rounded-lg border border-slate-200 bg-white">
              <header className="border-b border-slate-100 px-5 py-3.5">
                <h2 className="text-sm font-semibold text-slate-900">Comment le solde est calculé</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Règles appliquées par le serveur, jamais recalculées par l’interface.
                </p>
              </header>

              <ul className="divide-y divide-slate-100 px-5">
                {REGLES.map((regle) => (
                  <li key={regle} className="flex gap-2.5 py-2.5 text-sm text-slate-600">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400"
                    />
                    {regle}
                  </li>
                ))}
              </ul>

              <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                Une demande n’est décomptée qu’au moment de son acceptation par le responsable RH.
              </p>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

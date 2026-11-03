import { StatutTrancheBadge } from './CongeStatut.jsx'
import { TYPE_TRANCHE_LABELS } from '../../config/contracts.js'
import { formatDate, isoDateLocale } from '../../utils/format.js'

const NOMBRE = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

/* Mêmes niveaux de texte que MesCongesPage */
const TXT = {
  titre: 'text-slate-900',
  corps: 'text-slate-700',
  secondaire: 'text-slate-600',
  discret: 'text-slate-500',
}

function jours(valeur) {
  if (valeur === null || valeur === undefined || Number.isNaN(Number(valeur))) return '—'
  return NOMBRE.format(Number(valeur))
}

function joursRestantsAvantExpiration(dateExpiration) {
  if (!dateExpiration) return null
  const expiration = new Date(`${dateExpiration}T00:00:00`)
  if (Number.isNaN(expiration.getTime())) return null
  const aujourdHui = new Date(`${isoDateLocale()}T00:00:00`)
  return Math.round((expiration - aujourdHui) / 86400000)
}

function Metric({ label, value, suffix, accent = false }) {
  return (
    <div className="px-5 py-4">
      <dt className={`text-[13px] ${TXT.secondaire}`}>{label}</dt>
      <dd
        className={[
          'mt-1 text-2xl font-semibold tabular-nums tracking-tight',
          accent ? TXT.titre : TXT.corps,
        ].join(' ')}
      >
        {value}
        {suffix && <span className={`ml-1 text-sm font-normal ${TXT.discret}`}>{suffix}</span>}
      </dd>
    </div>
  )
}

function Chiffre({ label, children, fort = false }) {
  return (
    <div>
      <dt className={`text-xs ${TXT.secondaire}`}>{label}</dt>
      <dd
        className={`mt-0.5 text-sm tabular-nums ${
          fort ? `font-semibold ${TXT.titre}` : `font-medium ${TXT.corps}`
        }`}
      >
        {children}
      </dd>
    </div>
  )
}

function TrancheRow({ tranche }) {
  const acquis = Number(tranche.joursAcquis) || 0
  const consommes = Number(tranche.joursConsommes) || 0
  const restants = Number(tranche.joursRestants) || 0
  const pourcentageRestant = acquis > 0 ? Math.min(100, Math.max(0, (restants / acquis) * 100)) : 0
  const reste = joursRestantsAvantExpiration(tranche.dateExpiration)
  const expiree = reste !== null && reste <= 0

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-sm font-semibold leading-5 ${TXT.titre}`}>
            {TYPE_TRANCHE_LABELS[tranche.typeTranche] || tranche.typeTranche || 'Tranche'}
            {tranche.anneeCycle ? (
              <span className={`ml-1.5 font-normal ${TXT.discret}`}>cycle {tranche.anneeCycle}</span>
            ) : null}
          </p>
          <p className={`mt-0.5 text-[13px] leading-5 tabular-nums ${TXT.discret}`}>
            Ouverte le {formatDate(tranche.dateOuverture)}, expire le{' '}
            {formatDate(tranche.dateExpiration)}
          </p>
        </div>
        <StatutTrancheBadge statut={expiree ? 'EXPIREE' : tranche.statut} />
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-3">
        <Chiffre label="Acquis">{jours(acquis)} j</Chiffre>
        <Chiffre label="Consommés">{jours(consommes)} j</Chiffre>
        <Chiffre label="Restants" fort>
          {jours(restants)} j
        </Chiffre>
      </dl>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-sm bg-slate-100"
        role="img"
        aria-label={`${jours(restants)} jours restants sur ${jours(acquis)} acquis`}
      >
        <div
          className={expiree ? 'h-full bg-slate-300' : 'h-full bg-slate-700'}
          style={{ width: `${pourcentageRestant}%` }}
        />
      </div>

      <p className={`mt-1.5 text-[13px] leading-5 ${TXT.secondaire}`}>
        {expiree
          ? 'Tranche expirée : les jours restants ne sont plus consommables.'
          : reste !== null
            ? `Consommable encore ${jours(reste)} jour${Math.abs(reste) > 1 ? 's' : ''} avant expiration.`
            : 'Date d’expiration non communiquée.'}
      </p>
    </li>
  )
}

/**
 * SoldeCongesPanel — résumé compact du solde global et détail des tranches.
 * Les valeurs proviennent du backend : aucun recalcul métier ici.
 */
export default function SoldeCongesPanel({
  solde,
  title = 'Solde de congés',
  description,
  actions,
  loading = false,
  error = null,
}) {
  const tranches = Array.isArray(solde?.tranches) ? solde.tranches : []
  const aucuneTranche = !!solde && tranches.length === 0

  return (
    <section className="rounded-sm border border-slate-200 bg-white antialiased">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
        <div>
          <h2 className={`text-base font-semibold leading-6 tracking-tight ${TXT.titre}`}>{title}</h2>
          {description && (
            <p className={`mt-0.5 text-[13px] leading-5 ${TXT.secondaire}`}>{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>

      {loading && (
        <p className={`px-5 py-6 text-sm ${TXT.secondaire}`} role="status">
          Chargement du solde…
        </p>
      )}

      {!loading && error && (
        <p className={`px-5 py-6 text-sm font-medium ${TXT.titre}`} role="alert">
          {error.message || 'Solde indisponible.'}
        </p>
      )}

      {!loading && !error && solde && (
        <>
          <dl className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Metric
              label="Jours restants"
              value={jours(solde.totalJoursRestants)}
              suffix="jours"
              accent
            />
            <Metric label="Jours acquis" value={jours(solde.totalJoursAcquis)} suffix="jours" />
            <Metric label="Jours consommés" value={jours(solde.totalJoursConsommes)} suffix="jours" />
          </dl>

          <div className="border-t border-slate-200">
            <h3 className={`bg-slate-50 px-5 py-2.5 text-sm font-semibold ${TXT.titre}`}>
              Tranches{' '}
              <span className={`font-normal tabular-nums ${TXT.discret}`}>({tranches.length})</span>
            </h3>

            {aucuneTranche ? (
              <p className={`px-5 py-4 text-sm leading-6 ${TXT.secondaire}`}>
                Aucune tranche n’est encore ouverte pour cet employé. Les tranches sont créées à
                partir du premier anniversaire d’embauche.
              </p>
            ) : (
              <ul className="divide-y divide-slate-200 border-t border-slate-200">
                {tranches.map((tranche) => (
                  <TrancheRow key={tranche.id} tranche={tranche} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  )
}
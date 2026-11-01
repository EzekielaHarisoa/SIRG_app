import { STATUTS_DEMANDE, STATUTS_TRANCHE, labelStatutDemande } from '../../config/contracts.js'

const TONES = {
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
  neutral: 'border-slate-200 bg-slate-100 text-slate-600',
}

const DOTS = {
  warning: 'bg-amber-500',
  success: 'bg-emerald-500',
  danger: 'bg-rose-500',
  neutral: 'bg-slate-400',
}

/**
 * Badge — étiquette de statut discrète (pas de dégradé, pas d'ombre).
 */
export function Badge({ tone = 'neutral', children }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium',
        TONES[tone] || TONES.neutral,
      ].join(' ')}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOTS[tone] || DOTS.neutral}`} />
      {children}
    </span>
  )
}

/** Statut d'une demande : EN_ATTENTE / ACCEPTER / REFUSER. */
export function StatutDemandeBadge({ status }) {
  const tone = STATUTS_DEMANDE[status]?.tone || 'neutral'
  return <Badge tone={tone}>{labelStatutDemande(status)}</Badge>
}

/** Statut d'une tranche : ACTIVE / EXPIREE. */
export function StatutTrancheBadge({ statut }) {
  const config = STATUTS_TRANCHE[statut]
  return <Badge tone={config?.tone || 'neutral'}>{config?.label || statut || '—'}</Badge>
}

export default Badge

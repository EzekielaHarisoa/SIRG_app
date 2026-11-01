import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import IdentityStrip from '../../components/ui/IdentityStrip.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import DemandeCongeForm from '../../components/conges/DemandeCongeForm.jsx'
import { StatutDemandeBadge } from '../../components/conges/CongeStatut.jsx'

import { useApi } from '../../hooks/useApi.js'
import { getDemandesByEmploye, createDemande } from '../../services/demandeCongeService.js'
import { getSoldeGlobal } from '../../services/soldeCongeService.js'
import { DEMANDE_CONGE_FIELDS as F, STATUTS_DEMANDE, labelTypeConge } from '../../config/contracts.js'
import { formatDate } from '../../utils/format.js'

const NOMBRE = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

function dureeJours(debut, fin) {
  if (!debut || !fin) return null
  const d = new Date(`${debut}T00:00:00`)
  const f = new Date(`${fin}T00:00:00`)
  if (Number.isNaN(d.getTime()) || Number.isNaN(f.getTime())) return null
  return Math.round((f - d) / 86400000) + 1
}

function Carte({ title, description, aside, children, bodyClassName = '' }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        {aside}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

function LigneDetail({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-800">{children}</dd>
    </div>
  )
}

export default function MesCongesPage() {
  const { user } = useAuth()
  const matricule = user?.numeroMatricule ?? null

  const [formOuvert, setFormOuvert] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const envoiRef = useRef(false)
  const [erreurEnvoi, setErreurEnvoi] = useState(null)
  const [succes, setSucces] = useState(null)
  const [selection, setSelection] = useState(null)

  const { data, error, loading, refetch } = useApi(
    () => (matricule ? getDemandesByEmploye(matricule) : Promise.resolve([])),
    [matricule],
  )

  const soldeQuery = useApi(
    () => (matricule ? getSoldeGlobal(matricule) : Promise.resolve(null)),
    [matricule],
  )

  const demandes = useMemo(() => (Array.isArray(data) ? data : []), [data])

  const compteurs = useMemo(() => {
    const parStatut = { EN_ATTENTE: 0, ACCEPTER: 0, REFUSER: 0 }
    demandes.forEach((d) => {
      if (parStatut[d.status] !== undefined) parStatut[d.status] += 1
    })
    return parStatut
  }, [demandes])

  const handleSubmit = async (payload) => {
    if (envoiRef.current) return
    envoiRef.current = true
    setEnvoi(true)
    setErreurEnvoi(null)
    setSucces(null)

    try {
      await createDemande(payload)
      setFormOuvert(false)
      setSucces('Votre demande de congé a été enregistrée et attend la décision du responsable RH.')
      await Promise.all([refetch(), soldeQuery.refetch()])
    } catch (err) {
      setErreurEnvoi(err)
    } finally {
      envoiRef.current = false
      setEnvoi(false)
    }
  }

  const ouvrirFormulaire = () => {
    setErreurEnvoi(null)
    setFormOuvert(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes congés"
        description="Suivez vos demandes et déposez une nouvelle demande de congé."
        actions={
          <Button variant="primary" onClick={ouvrirFormulaire} disabled={!matricule}>
            Nouvelle demande
          </Button>
        }
      />

      {!matricule && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Votre profil ne contient pas de numéro matricule : vos demandes sont indisponibles.
          Contactez le service RH pour rattacher votre compte à un employé.
        </div>
      )}

      {succes && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span>{succes}</span>
          <button
            type="button"
            onClick={() => setSucces(null)}
            className="text-xs font-medium text-emerald-700 hover:underline"
          >
            Fermer
          </button>
        </div>
      )}

      {matricule && (
        <>
          <IdentityStrip
            title={user?.nomEtPrenoms || user?.login || 'Utilisateur'}
            meta={`Matricule ${matricule}`}
            aside={
              <span className="text-xs tabular-nums text-slate-500">
                {demandes.length} demande{demandes.length > 1 ? 's' : ''} enregistrée
                {demandes.length > 1 ? 's' : ''}
              </span>
            }
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Demandes */}
            <div className="lg:col-span-3">
              <Carte
                title="Mes demandes"
                description="De la plus récente à la plus ancienne."
                aside={
                  <span className="text-xs tabular-nums text-slate-500">
                    {demandes.length} au total
                  </span>
                }
                bodyClassName="px-5"
              >
                {loading ? (
                  <p className="py-10 text-center text-sm text-slate-500" role="status">
                    Chargement de vos demandes…
                  </p>
                ) : error ? (
                  <div className="py-4">
                    <ErrorState error={error} onRetry={refetch} />
                  </div>
                ) : demandes.length === 0 ? (
                  <div className="py-6">
                    <EmptyState
                      label="Aucune demande de congé"
                      hint="Votre historique apparaîtra ici dès votre première demande."
                      action={
                        <Button variant="secondary" size="sm" onClick={ouvrirFormulaire}>
                          Créer une demande
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {demandes.map((demande) => {
                      const jours = dureeJours(demande.dateDeDebut, demande.dateFin)
                      return (
                        <li
                          key={demande[F.id]}
                          className="flex items-start justify-between gap-3 py-3.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-slate-900">
                                {labelTypeConge(demande.typeConge)}
                              </p>
                              <StatutDemandeBadge status={demande.status} />
                            </div>
                            <p className="mt-1 text-xs tabular-nums text-slate-500">
                              {formatDate(demande.dateDeDebut)} → {formatDate(demande.dateFin)}
                              {jours ? ` · ${jours} jour${jours > 1 ? 's' : ''}` : ''}
                            </p>
                            {demande.motifRefus && (
                              <p className="mt-1.5 text-xs text-rose-700">
                                Motif du refus : {demande.motifRefus}
                              </p>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="hidden text-xs tabular-nums text-slate-400 sm:inline">
                              Demandée le {formatDate(demande.dateDeDemande)}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => setSelection(demande)}>
                              Détails
                            </Button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Carte>
            </div>

            {/* Synthèse */}
            <div className="space-y-6 lg:col-span-2">
              <Carte title="Répartition" description="État de vos demandes." bodyClassName="px-5">
                <ul className="divide-y divide-slate-100">
                  {[STATUTS_DEMANDE.EN_ATTENTE, STATUTS_DEMANDE.ACCEPTER, STATUTS_DEMANDE.REFUSER].map(
                    (statut) => (
                      <li
                        key={statut.value}
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <StatutDemandeBadge status={statut.value} />
                        <span className="text-sm font-semibold tabular-nums text-slate-800">
                          {compteurs[statut.value]}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </Carte>

              <Carte title="Solde disponible" bodyClassName="px-5 py-4">
                {soldeQuery.loading ? (
                  <p className="text-sm text-slate-500">Chargement…</p>
                ) : soldeQuery.error ? (
                  <p className="text-sm text-slate-500">Solde indisponible pour le moment.</p>
                ) : (
                  <>
                    <p className="text-2xl font-semibold tabular-nums text-slate-900">
                      {NOMBRE.format(Number(soldeQuery.data?.totalJoursRestants ?? 0))}
                      <span className="ml-1 text-sm font-normal text-slate-500">jours restants</span>
                    </p>
                    <p className="mt-1 text-xs tabular-nums text-slate-500">
                      {NOMBRE.format(Number(soldeQuery.data?.totalJoursAcquis ?? 0))} acquis ·{' '}
                      {NOMBRE.format(Number(soldeQuery.data?.totalJoursConsommes ?? 0))} consommés
                    </p>
                    <Link
                      to="/employe/solde"
                      className="mt-3 inline-block text-xs font-medium text-blue-700 hover:underline"
                    >
                      Voir le détail des tranches
                    </Link>
                  </>
                )}
              </Carte>
            </div>
          </div>
        </>
      )}

      {/* Détail d'une demande */}
      <Modal
        open={!!selection}
        onClose={() => setSelection(null)}
        title="Détail de la demande"
        size="md"
      >
        {selection && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {labelTypeConge(selection.typeConge)}
                </p>
                <p className="text-xs tabular-nums text-slate-500">Demande n° {selection.id}</p>
              </div>
              <StatutDemandeBadge status={selection.status} />
            </div>

            <dl className="divide-y divide-slate-100 border-y border-slate-100">
              <LigneDetail label="Du">{formatDate(selection.dateDeDebut)}</LigneDetail>
              <LigneDetail label="Au">{formatDate(selection.dateFin)}</LigneDetail>
              <LigneDetail label="Durée">
                {dureeJours(selection.dateDeDebut, selection.dateFin) ?? '—'} jour(s)
              </LigneDetail>
              <LigneDetail label="Demandée le">{formatDate(selection.dateDeDemande)}</LigneDetail>
              <LigneDetail label="Motif">{selection.motif || '—'}</LigneDetail>
            </dl>

            {selection.status === STATUTS_DEMANDE.REFUSER.value && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
                  Motif du refus
                </p>
                <p className="mt-1 text-sm text-rose-800">{selection.motifRefus || 'Non précisé.'}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelection(null)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Nouvelle demande */}
      <Modal
        open={formOuvert}
        onClose={() => {
          if (envoi) return
          setFormOuvert(false)
        }}
        title="Nouvelle demande de congé"
        size="lg"
      >
        <DemandeCongeForm
          onSubmit={handleSubmit}
          loading={envoi}
          error={erreurEnvoi}
          onCancel={() => setFormOuvert(false)}
        />
      </Modal>
    </div>
  )
}

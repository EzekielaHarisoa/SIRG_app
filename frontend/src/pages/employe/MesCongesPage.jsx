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

/* Le bleu n'est utilisé que pour l'action principale et les liens */
const BTN_PRIMARY = '!rounded-none !bg-[#005EB8] hover:!bg-[#00449E] focus:!ring-[#005EB8]/40'
const BTN_SECONDARY = '!rounded-none !border-slate-300 !text-slate-800 hover:!bg-slate-50'
const BTN_LINK = '!rounded-none !font-medium !text-[#005EB8] hover:!bg-slate-50'

/*
 * Hiérarchie typographique (5 niveaux de texte, tous lisibles sur fond blanc) :
 *  - TXT.titre       : titres et valeurs importantes
 *  - TXT.corps       : contenu courant
 *  - TXT.secondaire  : libellés, descriptions
 *  - TXT.discret     : métadonnées (dates de demande, durées)
 */
const TXT = {
  titre: 'text-slate-900',
  corps: 'text-slate-700',
  secondaire: 'text-slate-600',
  discret: 'text-slate-500',
}

function dureeJours(debut, fin) {
  if (!debut || !fin) return null
  const d = new Date(`${debut}T00:00:00`)
  const f = new Date(`${fin}T00:00:00`)
  if (Number.isNaN(d.getTime()) || Number.isNaN(f.getTime())) return null
  return Math.round((f - d) / 86400000) + 1
}

function Carte({ title, description, aside, children, bodyClassName = '' }) {
  return (
    <section className="rounded-sm border border-slate-200 bg-white">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div className="min-w-0">
          <h2 className={`text-base font-semibold leading-6 tracking-tight ${TXT.titre}`}>{title}</h2>
          {description && (
            <p className={`mt-0.5 text-[13px] leading-5 ${TXT.secondaire}`}>{description}</p>
          )}
        </div>
        {aside}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}

function Ligne({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={`text-sm ${TXT.secondaire}`}>{label}</dt>
      <dd className={`break-words text-right text-sm font-semibold tabular-nums ${TXT.titre}`}>
        {children}
      </dd>
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

  const joursRestants = Number(soldeQuery.data?.totalJoursRestants ?? 0)

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
    <div className="space-y-5 antialiased">
      <PageHeader
        title="Mes congés"
        description="Suivez vos demandes et déposez une nouvelle demande de congé."
        actions={
          <Button
            variant="primary"
            className={BTN_PRIMARY}
            onClick={ouvrirFormulaire}
            disabled={!matricule}
          >
            Nouvelle demande
          </Button>
        }
      />

      {!matricule && (
        <div
          role="alert"
          className="rounded-sm border border-slate-300 bg-slate-50 p-3.5 text-sm leading-6 text-slate-800"
        >
          <p className="font-semibold">Numéro matricule manquant</p>
          <p className="mt-0.5">
            Votre profil n'est rattaché à aucun employé, vos demandes sont donc indisponibles.
            Contactez le service RH pour corriger cela.
          </p>
        </div>
      )}

      {succes && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900"
        >
          <span className="font-medium">{succes}</span>
          <button
            type="button"
            onClick={() => setSucces(null)}
            className="shrink-0 text-sm font-semibold text-[#2B5CB8] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2B5CB8]/40"
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
              <span className={`text-[13px] tabular-nums ${TXT.secondaire}`}>
                <span className={`font-semibold ${TXT.titre}`}>{demandes.length}</span> demande
                {demandes.length > 1 ? 's' : ''} enregistrée{demandes.length > 1 ? 's' : ''}
              </span>
            }
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            {/* Demandes : tableau */}
            <div className="lg:col-span-3">
              <Carte
                title="Mes demandes"
                description="De la plus récente à la plus ancienne."
                aside={
                  <span className={`text-[13px] tabular-nums ${TXT.secondaire}`}>
                    {demandes.length} au total
                  </span>
                }
              >
                {loading ? (
                  <p className={`py-10 text-center text-sm ${TXT.secondaire}`} role="status">
                    Chargement de vos demandes…
                  </p>
                ) : error ? (
                  <div className="p-4">
                    <ErrorState error={error} onRetry={refetch} />
                  </div>
                ) : demandes.length === 0 ? (
                  <div className="py-6">
                    <EmptyState
                      label="Aucune demande de congé"
                      hint="Votre historique apparaîtra ici dès votre première demande."
                      action={
                        <Button
                          variant="secondary"
                          size="sm"
                          className={BTN_SECONDARY}
                          onClick={ouvrirFormulaire}
                        >
                          Créer une demande
                        </Button>
                      }
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
                          <th scope="col" className="px-4 py-2.5 font-semibold">Type</th>
                          <th scope="col" className="px-4 py-2.5 font-semibold">Période</th>
                          <th scope="col" className="px-4 py-2.5 font-semibold">Statut</th>
                          <th scope="col" className="px-4 py-2.5">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {demandes.map((demande) => {
                          const jours = dureeJours(demande.dateDeDebut, demande.dateFin)
                          return (
                            <tr key={demande[F.id]} className="align-top">
                              <td className="px-4 py-3">
                                <p className={`text-sm font-semibold leading-5 ${TXT.titre}`}>
                                  {labelTypeConge(demande.typeConge)}
                                </p>
                                <p className={`mt-0.5 text-[13px] leading-5 tabular-nums ${TXT.discret}`}>
                                  Demandée le {formatDate(demande.dateDeDemande)}
                                </p>
                                {demande.motifRefus && (
                                  <p className="mt-1 text-[13px] leading-5 text-slate-700">
                                    <span className="font-semibold">Motif du refus :</span>{' '}
                                    {demande.motifRefus}
                                  </p>
                                )}
                              </td>
                              <td className={`px-4 py-3 text-sm leading-5 tabular-nums ${TXT.corps}`}>
                                <span className="font-medium text-slate-900">
                                  {formatDate(demande.dateDeDebut)}
                                </span>{' '}
                                <span className={TXT.discret}>au</span>{' '}
                                <span className="font-medium text-slate-900">
                                  {formatDate(demande.dateFin)}
                                </span>
                                {jours && (
                                  <p className={`mt-0.5 text-[13px] ${TXT.discret}`}>
                                    {jours} jour{jours > 1 ? 's' : ''}
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <StatutDemandeBadge status={demande.status} />
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={BTN_LINK}
                                  onClick={() => setSelection(demande)}
                                >
                                  Détails
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Carte>
            </div>

            {/* Synthèse */}
            <div className="space-y-5 lg:col-span-2">
              <Carte title="Solde de congés" bodyClassName="px-4">
                {soldeQuery.loading ? (
                  <p className={`py-4 text-sm ${TXT.secondaire}`}>Chargement…</p>
                ) : soldeQuery.error ? (
                  <p className={`py-4 text-sm ${TXT.secondaire}`}>
                    Solde indisponible pour le moment.
                  </p>
                ) : (
                  <>
                    <dl className="divide-y divide-slate-200">
                      <Ligne label="Jours acquis">
                        {NOMBRE.format(Number(soldeQuery.data?.totalJoursAcquis ?? 0))}
                      </Ligne>
                      <Ligne label="Jours consommés">
                        {NOMBRE.format(Number(soldeQuery.data?.totalJoursConsommes ?? 0))}
                      </Ligne>
                      <div className="flex items-baseline justify-between gap-4 py-3">
                        <dt className={`text-sm font-semibold ${TXT.titre}`}>Jours restants</dt>
                        <dd
                          className={`text-xl font-semibold tabular-nums ${TXT.titre}`}
                        >
                          {NOMBRE.format(joursRestants)}
                        </dd>
                      </div>
                    </dl>
                    <div className="border-t border-slate-200 py-3">
                      <Link
                        to="/employe/solde"
                        className="text-[13px] font-semibold text-[#2B5CB8] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2B5CB8]/40"
                      >
                        Voir le détail des tranches
                      </Link>
                    </div>
                  </>
                )}
              </Carte>

              <Carte title="Répartition" description="État de vos demandes." bodyClassName="px-4">
                <ul className="divide-y divide-slate-200">
                  {[STATUTS_DEMANDE.EN_ATTENTE, STATUTS_DEMANDE.ACCEPTER, STATUTS_DEMANDE.REFUSER].map(
                    (statut) => (
                      <li
                        key={statut.value}
                        className="flex items-center justify-between gap-3 py-2.5"
                      >
                        <StatutDemandeBadge status={statut.value} />
                        <span className={`text-base font-semibold tabular-nums ${TXT.titre}`}>
                          {compteurs[statut.value]}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
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
                <p className={`text-base font-semibold leading-6 tracking-tight ${TXT.titre}`}>
                  {labelTypeConge(selection.typeConge)}
                </p>
                <p className={`text-[13px] tabular-nums ${TXT.secondaire}`}>
                  Demande n° {selection.id}
                </p>
              </div>
              <StatutDemandeBadge status={selection.status} />
            </div>

            <dl className="divide-y divide-slate-200 border-y border-slate-200">
              <Ligne label="Du">{formatDate(selection.dateDeDebut)}</Ligne>
              <Ligne label="Au">{formatDate(selection.dateFin)}</Ligne>
              <Ligne label="Durée">
                {dureeJours(selection.dateDeDebut, selection.dateFin) ?? '—'} jour(s)
              </Ligne>
              <Ligne label="Demandée le">{formatDate(selection.dateDeDemande)}</Ligne>
              <Ligne label="Motif">
                <span className="font-medium">{selection.motif || '—'}</span>
              </Ligne>
            </dl>

            {selection.status === STATUTS_DEMANDE.REFUSER.value && (
              <div className="rounded-sm border border-slate-300 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Motif du refus</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {selection.motifRefus || 'Non précisé.'}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="secondary" className={BTN_SECONDARY} onClick={() => setSelection(null)}>
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
import { useMemo, useRef, useState } from 'react'

import PageHeader from '../../components/ui/PageHeader.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import LoadingState from '../../components/ui/LoadingState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import FormField from '../../components/ui/FormField.jsx'
import { StatutDemandeBadge } from '../../components/conges/CongeStatut.jsx'
import SoldeCongesPanel from '../../components/conges/SoldeCongesPanel.jsx'
import DemandeCongeForm from '../../components/conges/DemandeCongeForm.jsx'

import { useApi } from '../../hooks/useApi.js'
import { getAllEmployes } from '../../services/employeService.js'
import { getSoldeGlobal } from '../../services/soldeCongeService.js'
import {
  getAllDemandes,
  createDemande,
  accepterDemande,
  refuserDemande,
} from '../../services/demandeCongeService.js'
import {
  DEMANDE_CONGE_FIELDS as F,
  STATUT_OPTIONS,
  STATUTS_DEMANDE,
  TYPE_CONGE_OPTIONS,
  labelTypeConge,
} from '../../config/contracts.js'
import { formatDate } from '../../utils/format.js'

/* Palette de la page : bleu #005EB8, marine #00449E, teinte #E3EEFC, gris slate. */
const FILTRES_VIDES = { recherche: '', statut: '', type: '' }

function dureeJours(debut, fin) {
  if (!debut || !fin) return null
  const d = new Date(`${debut}T00:00:00`)
  const f = new Date(`${fin}T00:00:00`)
  if (Number.isNaN(d.getTime()) || Number.isNaN(f.getTime())) return null
  return Math.round((f - d) / 86400000) + 1
}

function LigneDetail({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-800">{children}</dd>
    </div>
  )
}

function Compteur({ label, valeur }) {
  return (
    <div className="px-5 py-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-slate-800">{valeur}</p>
    </div>
  )
}

export default function CongesRHPage() {
  const [filtres, setFiltres] = useState(FILTRES_VIDES)
  const [detail, setDetail] = useState(null)
  const [decision, setDecision] = useState(null) // { action, demande }
  const [motifRefus, setMotifRefus] = useState('')
  const [erreurDecision, setErreurDecision] = useState(null)
  const [succes, setSucces] = useState(null)
  const [enCours, setEnCours] = useState(false)
  const enCoursRef = useRef(false)
  const [formOuvert, setFormOuvert] = useState(false)
  const [envoiForm, setEnvoiForm] = useState(false)
  const envoiFormRef = useRef(false)
  const [erreurForm, setErreurForm] = useState(null)

  const demandesQuery = useApi(() => getAllDemandes(), [])
  const employesQuery = useApi(() => getAllEmployes(), [])

  const demandes = useMemo(
    () => (Array.isArray(demandesQuery.data) ? demandesQuery.data : []),
    [demandesQuery.data],
  )

  const employesParMatricule = useMemo(() => {
    const map = new Map()
    if (Array.isArray(employesQuery.data)) {
      employesQuery.data.forEach((employe) => {
        map.set(String(employe.numerMatricule), employe.nomEtPrenoms)
      })
    }
    return map
  }, [employesQuery.data])

  const nomEmploye = (matricule) =>
    employesParMatricule.get(String(matricule)) || 'Employé inconnu'

  const compteurs = useMemo(() => {
    const parStatut = { EN_ATTENTE: 0, ACCEPTER: 0, REFUSER: 0 }
    demandes.forEach((d) => {
      if (parStatut[d.status] !== undefined) parStatut[d.status] += 1
    })
    return parStatut
  }, [demandes])

  const demandesFiltrees = useMemo(() => {
    const recherche = filtres.recherche.trim().toLowerCase()

    return demandes.filter((demande) => {
      if (filtres.statut && demande.status !== filtres.statut) return false
      if (filtres.type && demande.typeConge !== filtres.type) return false
      if (!recherche) return true

      const nom = (employesParMatricule.get(String(demande.numeroMatricule)) || '').toLowerCase()
      return nom.includes(recherche) || String(demande.numeroMatricule).includes(recherche)
    })
  }, [demandes, filtres, employesParMatricule])

  const changerFiltre = (e) => {
    const { name, value } = e.target
    setFiltres((prev) => ({ ...prev, [name]: value }))
  }

  const resetFiltres = () => setFiltres(FILTRES_VIDES)

  const soldeQuery = useApi(
    () =>
      decision?.demande?.numeroMatricule
        ? getSoldeGlobal(decision.demande.numeroMatricule)
        : Promise.resolve(null),
    [decision?.demande?.numeroMatricule],
  )

  const ouvrirDecision = (action, demande) => {
    setDecision({ action, demande })
    setMotifRefus('')
    setErreurDecision(null)
    setSucces(null)
  }

  const fermerDecision = () => {
    if (enCours) return
    setDecision(null)
    setMotifRefus('')
    setErreurDecision(null)
  }

  const executerDecision = async () => {
    if (!decision || enCoursRef.current) return

    if (decision.action === 'refuser' && !motifRefus.trim()) {
      setErreurDecision(new Error('Le motif de refus est obligatoire.'))
      return
    }

    enCoursRef.current = true
    setEnCours(true)
    setErreurDecision(null)

    try {
      if (decision.action === 'accepter') {
        await accepterDemande(decision.demande.id)
        setSucces(
          `Demande n° ${decision.demande.id} de ${nomEmploye(
            decision.demande.numeroMatricule,
          )} acceptée. Les périodes et les tranches ont été mises à jour par le serveur.`,
        )
      } else {
        await refuserDemande(decision.demande.id, motifRefus.trim())
        setSucces(`Demande n° ${decision.demande.id} refusée.`)
      }

      setDecision(null)
      setMotifRefus('')
      await demandesQuery.refetch()
    } catch (err) {
      setErreurDecision(err)
    } finally {
      enCoursRef.current = false
      setEnCours(false)
    }
  }

  const creerDemande = async (payload) => {
    if (envoiFormRef.current) return
    envoiFormRef.current = true
    setEnvoiForm(true)
    setErreurForm(null)

    try {
      await createDemande(payload)
      setFormOuvert(false)
      setSucces('La demande de congé a été enregistrée et attend une décision.')
      await demandesQuery.refetch()
    } catch (err) {
      setErreurForm(err)
    } finally {
      envoiFormRef.current = false
      setEnvoiForm(false)
    }
  }

  const colonnes = [
    {
      key: F.numeroMatricule,
      label: 'Employé',
      render: (matricule) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800">{nomEmploye(matricule)}</p>
          <p className="text-xs tabular-nums text-slate-500">Matricule {matricule}</p>
        </div>
      ),
    },
    {
      key: F.typeConge,
      label: 'Type',
      render: (valeur) => (
        <span className="whitespace-nowrap text-slate-700">{labelTypeConge(valeur)}</span>
      ),
    },
    {
      key: F.dateDeDebut,
      label: 'Période',
      render: (_valeur, ligne) => (
        <span className="whitespace-nowrap tabular-nums text-slate-700">
          {formatDate(ligne.dateDeDebut)} → {formatDate(ligne.dateFin)}
        </span>
      ),
    },
    {
      key: 'duree',
      label: 'Jours',
      render: (_valeur, ligne) => (
        <span className="tabular-nums text-slate-600">
          {dureeJours(ligne.dateDeDebut, ligne.dateFin) ?? '—'}
        </span>
      ),
    },
    {
      key: F.dateDeDemande,
      label: 'Déposée le',
      render: (valeur) => (
        <span className="whitespace-nowrap tabular-nums text-slate-600">{formatDate(valeur)}</span>
      ),
    },
    {
      key: F.status,
      label: 'Statut',
      render: (valeur) => <StatutDemandeBadge status={valeur} />,
    },
    {
      key: 'actions',
      label: '',
      className: 'text-right',
      render: (_valeur, ligne) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDetail(ligne)}>
            Détails
          </Button>
          {ligne.status === STATUTS_DEMANDE.EN_ATTENTE.value && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => ouvrirDecision('accepter', ligne)}
              >
                Accepter
              </Button>
              <Button variant="danger" size="sm" onClick={() => ouvrirDecision('refuser', ligne)}>
                Refuser
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  const aucunResultat = demandes.length > 0 && demandesFiltrees.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes de congé"
        description="Examinez les demandes, acceptez-les ou refusez-les avec un motif."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={demandesQuery.refetch}
              loading={demandesQuery.loading}
            >
              Actualiser
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setErreurForm(null)
                setFormOuvert(true)
              }}
            >
              Nouvelle demande
            </Button>
          </>
        }
      />

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

      <section className="grid grid-cols-2 divide-slate-100 rounded-lg border border-slate-200 bg-white sm:grid-cols-4 sm:divide-x">
        <Compteur label="Demandes" valeur={demandes.length} />
        <Compteur label="En attente" valeur={compteurs.EN_ATTENTE} />
        <Compteur label="Acceptées" valeur={compteurs.ACCEPTER} />
        <Compteur label="Refusées" valeur={compteurs.REFUSER} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Demandes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Les demandes en attente peuvent être acceptées ou refusées avec un motif.
            </p>
          </div>
          <span className="text-xs tabular-nums text-slate-500">
            {demandesFiltrees.length} / {demandes.length} affichée(s)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField
            label="Rechercher"
            name="recherche"
            value={filtres.recherche}
            onChange={changerFiltre}
            placeholder="Nom ou matricule"
          />
          <FormField
            label="Statut"
            name="statut"
            value={filtres.statut}
            onChange={changerFiltre}
            options={STATUT_OPTIONS}
          />
          <FormField
            label="Type de congé"
            name="type"
            value={filtres.type}
            onChange={changerFiltre}
            options={TYPE_CONGE_OPTIONS}
          />
          <div className="flex items-end">
            <Button variant="secondary" onClick={resetFiltres} className="w-full sm:w-auto">
              Réinitialiser
            </Button>
          </div>
        </div>

        {demandesQuery.loading ? (
          <LoadingState label="Chargement des demandes…" />
        ) : demandesQuery.error ? (
          <ErrorState error={demandesQuery.error} onRetry={demandesQuery.refetch} />
        ) : demandes.length === 0 ? (
          <EmptyState
            label="Aucune demande de congé"
            hint="Les demandes déposées par les employés apparaîtront ici."
          />
        ) : aucunResultat ? (
          <EmptyState
            label="Aucun résultat"
            hint="Aucune demande ne correspond aux filtres sélectionnés."
            action={
              <Button variant="secondary" size="sm" onClick={resetFiltres}>
                Réinitialiser les filtres
              </Button>
            }
          />
        ) : (
          <DataTable columns={colonnes} rows={demandesFiltrees} rowKey={F.id} />
        )}
      </section>

      {/* Détail */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Détail de la demande" size="md">
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {nomEmploye(detail.numeroMatricule)}
                </p>
                <p className="text-xs tabular-nums text-slate-500">
                  Matricule {detail.numeroMatricule} · demande n° {detail.id}
                </p>
              </div>
              <StatutDemandeBadge status={detail.status} />
            </div>

            <dl className="divide-y divide-slate-100 border-y border-slate-100">
              <LigneDetail label="Type">{labelTypeConge(detail.typeConge)}</LigneDetail>
              <LigneDetail label="Du">{formatDate(detail.dateDeDebut)}</LigneDetail>
              <LigneDetail label="Au">{formatDate(detail.dateFin)}</LigneDetail>
              <LigneDetail label="Durée">
                {dureeJours(detail.dateDeDebut, detail.dateFin) ?? '—'} jour(s)
              </LigneDetail>
              <LigneDetail label="Déposée le">{formatDate(detail.dateDeDemande)}</LigneDetail>
              <LigneDetail label="Motif">{detail.motif || '—'}</LigneDetail>
            </dl>

            {detail.motifRefus && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
                  Motif du refus
                </p>
                <p className="mt-1 text-sm text-rose-800">{detail.motifRefus}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Décision */}
      <Modal
        open={!!decision}
        onClose={fermerDecision}
        title={decision?.action === 'accepter' ? 'Accepter la demande' : 'Refuser la demande'}
        size="lg"
      >
        {decision && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {nomEmploye(decision.demande.numeroMatricule)}
                </p>
                <p className="text-xs tabular-nums text-slate-500">
                  Matricule {decision.demande.numeroMatricule} · demande n° {decision.demande.id}
                </p>
              </div>
              <StatutDemandeBadge status={decision.demande.status} />
            </div>

            <dl className="divide-y divide-slate-100 border-y border-slate-100">
              <LigneDetail label="Type">{labelTypeConge(decision.demande.typeConge)}</LigneDetail>
              <LigneDetail label="Période">
                {formatDate(decision.demande.dateDeDebut)} → {formatDate(decision.demande.dateFin)}
              </LigneDetail>
              <LigneDetail label="Durée">
                {dureeJours(decision.demande.dateDeDebut, decision.demande.dateFin) ?? '—'} jour(s)
              </LigneDetail>
              <LigneDetail label="Motif de l’employé">
                {decision.demande.motif || '—'}
              </LigneDetail>
            </dl>

            <SoldeCongesPanel
              solde={soldeQuery.data}
              loading={soldeQuery.loading}
              error={soldeQuery.error}
              title="Solde actuel de l’employé"
              description="Vérifié par le serveur au moment de l’acceptation."
            />

            {decision.action === 'accepter' ? (
              <p className="text-sm text-slate-600">
                L’acceptation enregistre les périodes d’absence et de congé payé, puis consomme les
                tranches disponibles. Si le solde est insuffisant, le serveur refuse l’opération.
              </p>
            ) : (
              <FormField
                label="Motif du refus"
                name="motifRefus"
                value={motifRefus}
                onChange={(e) => setMotifRefus(e.target.value)}
                rows={3}
                placeholder="Expliquez la raison du refus à l’employé."
                hint="Obligatoire, 255 caractères maximum."
                disabled={enCours}
                required
              />
            )}

            {erreurDecision && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                <p className="font-medium">
                  {decision.action === 'accepter'
                    ? 'L’acceptation n’a pas pu être effectuée.'
                    : 'Le refus n’a pas pu être effectué.'}
                </p>
                <p className="mt-1">{erreurDecision.message || 'Erreur inconnue.'}</p>
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={fermerDecision} disabled={enCours}>
                Annuler
              </Button>
              <Button
                variant={decision.action === 'accepter' ? 'primary' : 'danger'}
                onClick={executerDecision}
                loading={enCours}
                disabled={enCours || (decision.action === 'refuser' && !motifRefus.trim())}
              >
                {decision.action === 'accepter' ? 'Confirmer l’acceptation' : 'Confirmer le refus'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Création d'une demande pour un employé */}
      <Modal
        open={formOuvert}
        onClose={() => {
          if (envoiForm) return
          setFormOuvert(false)
        }}
        title="Nouvelle demande de congé"
        size="lg"
      >
        <DemandeCongeForm
          mode="rh"
          onSubmit={creerDemande}
          loading={envoiForm}
          error={erreurForm}
          submitLabel="Créer la demande"
          onCancel={() => setFormOuvert(false)}
        />
      </Modal>
    </div>
  )
}

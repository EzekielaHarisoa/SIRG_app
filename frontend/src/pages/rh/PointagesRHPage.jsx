import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import FormField from '../../components/ui/FormField.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import QrCodeCard from '../../components/pointages/QrCodeCard.jsx'
import PointageForm from '../../components/pointages/PointageForm.jsx'
import { useApi } from '../../hooks/useApi.js'
import {
  getAllPointages,
  getPointagesByMatricule,
  getPointagesByDate,
  getEvenementsByDate,
  createPointage,
} from '../../services/pointageService.js'
import { POINTAGE_FIELDS as F, labelEvenement } from '../../config/contracts.js'
import {
  formatCell,
  formatDate,
  formatHeure,
  isoDateLocale,
} from '../../utils/format.js'

const COLONNES_POINTAGES = [
  { key: 'numeroMatricule', label: 'Matricule' },
  { key: 'datePointage', label: 'Date', render: (valeur) => formatDate(valeur) },
  { key: 'heureEntree', label: 'Entrée', render: (valeur) => formatHeure(valeur) },
  { key: 'heureSortie', label: 'Sortie', render: (valeur) => formatHeure(valeur) },
  {
    key: 'retardMinute',
    label: 'Retard',
    render: (valeur) =>
      valeur === null || valeur === undefined ? '—' : `${formatCell(valeur)} min`,
  },
  {
    key: 'heureSup',
    label: 'Heures sup.',
    render: (valeur) =>
      valeur === null || valeur === undefined ? '—' : `${formatCell(valeur)} h`,
  },
]

const COLONNES_EVENEMENTS = [
  {
    key: 'typeEvenement',
    label: 'Événement',
    render: (valeur) => labelEvenement(valeur),
  },
  { key: 'dateHeure', label: 'Heure', render: (valeur) => formatHeure(valeur) },
  { key: 'modePointage', label: 'Mode' },
]

export default function PointagesRHPage() {
  // Liste des pointages journaliers
  const [filters, setFilters] = useState({ matricule: '', date: '' })
  const [active, setActive] = useState({ matricule: '', date: '' })

  // Événements d'un employé pour une journée
  const [evFilters, setEvFilters] = useState({
    matricule: '',
    date: isoDateLocale(),
  })
  const [evActive, setEvActive] = useState({ matricule: '', date: '' })

  // Saisie manuelle (secours RH)
  const [showForm, setShowForm] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const fetcher = () => {
    if (active.matricule) return getPointagesByMatricule(active.matricule)
    if (active.date) return getPointagesByDate(active.date)
    return getAllPointages()
  }

  const { data, error, loading, refetch } = useApi(fetcher, [active.matricule, active.date])

  const {
    data: evenements,
    error: erreurEvenements,
    loading: chargementEvenements,
    refetch: refetchEvenements,
  } = useApi(
    () =>
      evActive.matricule && evActive.date
        ? getEvenementsByDate(evActive.matricule, evActive.date)
        : Promise.resolve([]),
    [evActive.matricule, evActive.date],
  )

  const handleApply = () => setActive({ ...filters })
  const handleReset = () => {
    setFilters({ matricule: '', date: '' })
    setActive({ matricule: '', date: '' })
  }

  const handleEvenements = (evenement) => {
    evenement.preventDefault()
    if (!evFilters.matricule) return
    setEvActive({ ...evFilters })
  }

  const handleSubmit = async (payload) => {
    if (submitting) return
    setSubmitting(true)
    setSubmitError(null)
    setSuccess(false)
    try {
      await createPointage(payload)
      setSuccess(true)
      setShowForm(false)
      refetch()
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pointages"
        description="QR code d’entrée, pointages journaliers et événements enregistrés par les employés."
        actions={
          <Button variant="secondary" onClick={() => setShowForm(true)}>
            Saisie manuelle
          </Button>
        }
      />

      {success && (
        <div
          role="status"
          className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          Pointage enregistré avec succès.
        </div>
      )}

      <QrCodeCard />

      {/* Pointages journaliers */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Pointages des employés</h2>
          <p className="mt-1 text-sm text-slate-500">
            Récapitulatif calculé par le backend (retard et heures supplémentaires).
          </p>
        </div>

        <FilterBar
          filters={[
            { name: 'matricule', label: 'Matricule', placeholder: 'Ex : 2' },
            { name: 'date', label: 'Date', type: 'date' },
          ]}
          value={filters}
          onChange={setFilters}
          onApply={handleApply}
          onReset={handleReset}
          loading={loading}
        />

        <AsyncBoundary
          loading={loading}
          error={error}
          data={data}
          onRetry={refetch}
          emptyLabel="Aucun pointage trouvé."
        >
          {(rows) => (
            <DataTable columns={COLONNES_POINTAGES} rows={rows} rowKey="id" />
          )}
        </AsyncBoundary>
      </section>

      {/* Événements d'une journée */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Événements d’une journée</h2>
          <p className="mt-1 text-sm text-slate-500">
            Détail des scans QR : entrée, pauses et sortie d’un employé.
          </p>
        </div>

        <form
          onSubmit={handleEvenements}
          className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
        >
          <div className="min-w-[160px] flex-1">
            <FormField
              label="Matricule"
              name="matriculeEvenements"
              type="number"
              value={evFilters.matricule}
              onChange={(evenement) =>
                setEvFilters((precedent) => ({
                  ...precedent,
                  matricule: evenement.target.value,
                }))
              }
              placeholder="Ex : 2"
              required
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <FormField
              label="Date"
              name="dateEvenements"
              type="date"
              value={evFilters.date}
              onChange={(evenement) =>
                setEvFilters((precedent) => ({ ...precedent, date: evenement.target.value }))
              }
              required
            />
          </div>
          <div>
            <Button type="submit" variant="primary" loading={chargementEvenements}>
              Afficher
            </Button>
          </div>
        </form>

        {!evActive.matricule ? (
          <EmptyState
            label="Indiquez un matricule et une date"
            hint="Les événements de la journée sélectionnée s’afficheront ici."
          />
        ) : (
          <AsyncBoundary
            loading={chargementEvenements}
            error={erreurEvenements}
            data={evenements}
            onRetry={refetchEvenements}
            emptyLabel="Aucun événement enregistré pour cette journée."
          >
            {(rows) => (
              <DataTable columns={COLONNES_EVENEMENTS} rows={rows} rowKey="id" />
            )}
          </AsyncBoundary>
        )}
      </section>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Saisie manuelle d’un pointage"
        size="lg"
      >
        <p className="mb-4 text-sm text-slate-500">
          À utiliser uniquement en secours, lorsqu’un employé n’a pas pu scanner le QR code.
        </p>
        <PointageForm
          onSubmit={handleSubmit}
          loading={submitting}
          error={submitError}
          initial={{ [F.numeroMatricule]: filters.matricule }}
        />
      </Modal>
    </div>
  )
}

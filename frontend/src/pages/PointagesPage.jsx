import { useMemo, useState } from 'react'
import { Clock, Plus, Search, Loader2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { pointageService } from '../services/pointageService'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'

/**
 * Pointages page — connected to pointage-controller.
 *
 *   GET  /pointage                             — list
 *   POST /pointage                             — create
 *   GET  /pointage/filtreMatricule/{matricule} — filter by matricule
 *   GET  /pointage/filtreDate/{date}           — filter by date
 *
 * The backend computes retard / heures supplémentaires, so the create form
 * only collects the raw inputs (matricule, date, heures) — not computed values.
 *
 * ⚠️ Confirm the exact create-request schema and the date format expected by
 * the backend via Swagger, then adjust FIELD_DEFS accordingly.
 */
const FIELD_DEFS = [
  { name: 'numeroMatricule', label: 'Numéro matricule', required: true },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'heureEntree', label: "Heure d'entrée", required: true },
  { name: 'heureSortie', label: 'Heure de sortie', required: true },
]

function emptyForm() {
  return FIELD_DEFS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})
}

export default function PointagesPage() {
  const [filterType, setFilterType] = useState('all') // 'all' | 'matricule' | 'date'
  const [matricule, setMatricule] = useState('')
  const [date, setDate] = useState('')

  const fetcher = useMemo(() => {
    if (filterType === 'matricule' && matricule.trim()) {
      return () => pointageService.filterByMatricule(matricule.trim())
    }
    if (filterType === 'date' && date) {
      return () => pointageService.filterByDate(date)
    }
    return () => pointageService.list()
  }, [filterType, matricule, date])

  const { data, error, loading, refetch } = useApi(fetcher, [fetcher])

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const rows = Array.isArray(data) ? data : []

  const columns = useMemo(() => {
    if (rows.length === 0) return []
    return Object.keys(rows[0]).map((key, i) => ({
      key,
      header: key,
      className: i === 0 ? 'font-medium text-neutral-900' : '',
    }))
  }, [rows])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await pointageService.create(form)
      setModalOpen(false)
      setForm(emptyForm())
      refetch()
    } catch (err) {
      setSubmitError(err.message || "L'enregistrement a échoué.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Pointages</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Suivi des entrées et sorties des employés.
          </p>
        </div>
        <Button onClick={() => { setForm(emptyForm()); setSubmitError(null); setModalOpen(true) }}>
          <Plus className="h-4 w-4" />
          Nouveau pointage
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-700">Filtrer par</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous</option>
            <option value="matricule">Matricule</option>
            <option value="date">Date</option>
          </select>
        </div>
        {filterType === 'matricule' && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700">Numéro matricule</label>
            <input
              type="text"
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="ex. 12345"
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}
        {filterType === 'date' && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-neutral-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}
        {(filterType === 'matricule' || filterType === 'date') && (
          <Button variant="secondary" onClick={() => { setFilterType('all'); setMatricule(''); setDate('') }}>
            Réinitialiser
          </Button>
        )}
      </div>

      {loading && <LoadingState message="Chargement des pointages…" />}

      {error && (
        <ErrorState
          title="Erreur de chargement"
          message="Les pointages n'ont pas pu être chargés depuis le backend."
          onRetry={refetch}
        />
      )}

      {!loading && !error && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row, i) => row.id ?? i}
          empty={
            <EmptyState
              icon={Clock}
              title="Aucun pointage disponible"
              message="Aucun pointage ne correspond aux critères actuels."
            />
          }
        />
      )}

      <Modal
        open={modalOpen}
        title="Nouveau pointage"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="rounded-md border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELD_DEFS.map((f) => (
              <FormField
                key={f.name}
                label={f.label}
                name={f.name}
                type={f.type || 'text'}
                value={form[f.name]}
                onChange={handleChange}
                required={f.required}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-400">
            Le retard et les heures supplémentaires sont calculés par le
            backend — ne les saisissez pas manuellement.
          </p>
        </form>
      </Modal>
    </div>
  )
}

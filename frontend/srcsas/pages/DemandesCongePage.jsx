import { useMemo, useState } from 'react'
import { CalendarDays, Plus, Eye, Search, Loader2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { demandeCongeService } from '../services/demandeCongeService'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'

/**
 * Demandes de congé page — connected to demande-conge-controller.
 *
 *   GET  /demandeConge                            — list
 *   POST /demandeConge                           — create
 *   GET  /demandeConge/employe/{numeroMatricule} — by employé
 *   GET  /demandeConge/byId/{id}                 — by id
 *
 * No update/delete endpoints exist.
 *
 * ⚠️ Confirm the create-request schema via Swagger, then adjust FIELD_DEFS.
 */
const FIELD_DEFS = [
  { name: 'numeroMatricule', label: 'Numéro matricule', required: true },
  { name: 'dateDebut', label: 'Date de début', type: 'date', required: true },
  { name: 'dateFin', label: 'Date de fin', type: 'date', required: true },
  { name: 'typeConge', label: 'Type de congé' },
  { name: 'motif', label: 'Motif', as: 'textarea' },
]

function emptyForm() {
  return FIELD_DEFS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})
}

export default function DemandesCongePage() {
  const [filterType, setFilterType] = useState('all')
  const [matricule, setMatricule] = useState('')

  const fetcher = useMemo(() => {
    if (filterType === 'matricule' && matricule.trim()) {
      return () => demandeCongeService.getByEmploye(matricule.trim())
    }
    return () => demandeCongeService.list()
  }, [filterType, matricule])

  const { data, error, loading, refetch } = useApi(fetcher, [fetcher])

  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const [detail, setDetail] = useState(null) // { loading, data, error }
  const [detailRow, setDetailRow] = useState(null)

  const rows = Array.isArray(data) ? data : []

  const columns = useMemo(() => {
    if (rows.length === 0) return []
    const keys = Object.keys(rows[0])
    const cols = keys.map((key, i) => ({
      key,
      header: key,
      className: i === 0 ? 'font-medium text-neutral-900' : '',
    }))
    cols.push({
      key: '__view',
      header: '',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-primary-600"
          aria-label="Consulter"
          onClick={() => openDetail(row)}
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    })
    return cols
  }, [rows])

  function openDetail(row) {
    setDetailRow(row)
    setDetail({ loading: true, data: null, error: null })
    const id = row.id ?? row.idDemande
    demandeCongeService
      .getById(id)
      .then((res) => setDetail({ loading: false, data: res, error: null }))
      .catch((err) => setDetail({ loading: false, data: null, error: err }))
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await demandeCongeService.create(form)
      setModalOpen(false)
      setForm(emptyForm())
      refetch()
    } catch (err) {
      setSubmitError(err.message || "La création a échoué.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Demandes de congé</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Consultez et créez les demandes de congé des employés.
          </p>
        </div>
        <Button onClick={() => { setForm(emptyForm()); setSubmitError(null); setModalOpen(true) }}>
          <Plus className="h-4 w-4" />
          Nouvelle demande
        </Button>
      </div>

      {/* Filter by matricule */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-700">Filtrer par</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Toutes</option>
            <option value="matricule">Par employé</option>
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
        {filterType === 'matricule' && (
          <Button variant="secondary" onClick={() => { setFilterType('all'); setMatricule('') }}>
            Réinitialiser
          </Button>
        )}
      </div>

      {loading && <LoadingState message="Chargement des demandes…" />}

      {error && (
        <ErrorState
          title="Erreur de chargement"
          message="Les demandes de congé n'ont pas pu être chargées."
          onRetry={refetch}
        />
      )}

      {!loading && !error && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row, i) => row.id ?? row.idDemande ?? i}
          empty={
            <EmptyState
              icon={CalendarDays}
              title="Aucune demande disponible"
              message="Aucune demande de congé n'a été enregistrée."
            />
          }
        />
      )}

      {/* Create modal */}
      <Modal
        open={modalOpen}
        title="Nouvelle demande de congé"
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
                'Créer la demande'
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
                as={f.as || 'input'}
                value={form[f.name]}
                onChange={handleChange}
                required={f.required}
              />
            ))}
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal
        open={!!detailRow}
        title="Détail de la demande"
        onClose={() => setDetailRow(null)}
        size="md"
      >
        {detail?.loading && <LoadingState message="Chargement du détail…" />}
        {detail?.error && (
          <ErrorState
            title="Erreur"
            message="La demande n'a pas pu être chargée."
            onRetry={() => detailRow && openDetail(detailRow)}
          />
        )}
        {detail?.data && (
          <dl className="divide-y divide-neutral-100">
            {Object.entries(detail.data).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-2 py-2">
                <dt className="text-sm font-medium text-neutral-500">{key}</dt>
                <dd className="col-span-2 text-sm text-neutral-900 break-words">
                  {value === null || value === undefined ? '—' : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </div>
  )
}

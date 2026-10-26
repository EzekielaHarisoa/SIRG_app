import { useMemo, useState } from 'react'
import { FileText, Plus, Eye, Search, Loader2, Pencil } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { bulletinPaieService } from '../services/bulletinPaieService'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'

/**
 * Bulletins de paie page — connected to bulletin-paie-controller.
 *
 *   GET  /api/bulletins                          — list
 *   POST /api/bulletins                          — create
 *   GET  /api/bulletins/{id}                     — by id
 *   GET  /api/bulletins/employe/{numeroMatricule}— by employé
 *   GET  /api/bulletins/{id}/totalPrimes         — total primes
 *   PUT  /api/bulletins/{id}/totalPrimes         — update total primes
 *   GET  /api/bulletins/{id}/salaireBrut         — salaire brut
 *   PUT  /api/bulletins/{id}/salaireBrut         — update salaire brut
 *
 * The frontend does not recompute payroll rules; it displays and updates values
 * through the backend endpoints.
 *
 * ⚠️ Confirm the create-request schema and the PUT request bodies via Swagger,
 * then adjust FIELD_DEFS and the edit forms accordingly.
 */
const FIELD_DEFS = [
  { name: 'numeroMatricule', label: 'Numéro matricule', required: true },
  { name: 'periode', label: 'Période', required: true },
  { name: 'salaireBrut', label: 'Salaire brut', type: 'number' },
  { name: 'salaireNet', label: 'Salaire net', type: 'number' },
]

function emptyForm() {
  return FIELD_DEFS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})
}

export default function BulletinsPaiePage() {
  const [filterType, setFilterType] = useState('all')
  const [matricule, setMatricule] = useState('')

  const fetcher = useMemo(() => {
    if (filterType === 'matricule' && matricule.trim()) {
      return () => bulletinPaieService.getByEmploye(matricule.trim())
    }
    return () => bulletinPaieService.list()
  }, [filterType, matricule])

  const { data, error, loading, refetch } = useApi(fetcher, [fetcher])

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const [detail, setDetail] = useState(null) // { loading, data, error }
  const [detailRow, setDetailRow] = useState(null)
  const [extra, setExtra] = useState({ totalPrimes: null, salaireBrut: null })

  const [editField, setEditField] = useState(null) // 'totalPrimes' | 'salaireBrut'
  const [editValue, setEditValue] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState(null)

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
    setExtra({ totalPrimes: null, salaireBrut: null })
    const id = row.id
    bulletinPaieService
      .getById(id)
      .then((res) => setDetail({ loading: false, data: res, error: null }))
      .catch((err) => setDetail({ loading: false, data: null, error: err }))
    // Load extra values in parallel (best-effort).
    bulletinPaieService
      .getTotalPrimes(id)
      .then((v) => setExtra((prev) => ({ ...prev, totalPrimes: v })))
      .catch(() => {})
    bulletinPaieService
      .getSalaireBrut(id)
      .then((v) => setExtra((prev) => ({ ...prev, salaireBrut: v })))
      .catch(() => {})
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    try {
      await bulletinPaieService.create(form)
      setCreateOpen(false)
      setForm(emptyForm())
      refetch()
    } catch (err) {
      setSubmitError(err.message || 'La création a échoué.')
    } finally {
      setSubmitting(false)
    }
  }

  function openEdit(field) {
    setEditField(field)
    setEditError(null)
    const current = field === 'totalPrimes' ? extra.totalPrimes : extra.salaireBrut
    setEditValue(current !== null && current !== undefined ? String(current) : '')
  }

  async function handleEditSubmit(e) {
    e?.preventDefault()
    if (!detailRow) return
    setEditSubmitting(true)
    setEditError(null)
    const id = detailRow.id
    const payload = { valeur: editValue }
    try {
      if (editField === 'totalPrimes') {
        await bulletinPaieService.updateTotalPrimes(id, payload)
      } else {
        await bulletinPaieService.updateSalaireBrut(id, payload)
      }
      // Refresh the value.
      const refreshFn = editField === 'totalPrimes'
        ? bulletinPaieService.getTotalPrimes
        : bulletinPaieService.getSalaireBrut
      const v = await refreshFn(id)
      setExtra((prev) => ({ ...prev, [editField]: v }))
      setEditField(null)
    } catch (err) {
      setEditError(err.message || 'La mise à jour a échoué.')
    } finally {
      setEditSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Bulletins de paie</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Consultez les bulletins et mettez à jour le total des primes et le
            salaire brut.
          </p>
        </div>
        <Button onClick={() => { setForm(emptyForm()); setSubmitError(null); setCreateOpen(true) }}>
          <Plus className="h-4 w-4" />
          Nouveau bulletin
        </Button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-700">Filtrer par</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Tous</option>
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

      {loading && <LoadingState message="Chargement des bulletins…" />}

      {error && (
        <ErrorState
          title="Erreur de chargement"
          message="Les bulletins n'ont pas pu être chargés."
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
              icon={FileText}
              title="Aucun bulletin disponible"
              message="Aucun bulletin de paie ne correspond aux critères."
            />
          }
        />
      )}

      {/* Create modal */}
      <Modal
        open={createOpen}
        title="Nouveau bulletin de paie"
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création…
                </>
              ) : (
                'Créer'
              )}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
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
            Les champs exacts doivent être confirmés via Swagger.
          </p>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal
        open={!!detailRow}
        title="Détail du bulletin"
        onClose={() => setDetailRow(null)}
        size="lg"
      >
        {detail?.loading && <LoadingState message="Chargement du détail…" />}
        {detail?.error && (
          <ErrorState
            title="Erreur"
            message="Le bulletin n'a pas pu être chargé."
            onRetry={() => detailRow && openDetail(detailRow)}
          />
        )}
        {detail?.data && (
          <div className="space-y-5">
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Total primes */}
              <div className="rounded-md border border-neutral-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Total des primes
                </p>
                <p className="mt-1 text-lg font-semibold text-neutral-900">
                  {extra.totalPrimes === null || extra.totalPrimes === undefined
                    ? '—'
                    : String(extra.totalPrimes)}
                </p>
                <button
                  type="button"
                  onClick={() => openEdit('totalPrimes')}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Mettre à jour
                </button>
              </div>

              {/* Salaire brut */}
              <div className="rounded-md border border-neutral-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Salaire brut
                </p>
                <p className="mt-1 text-lg font-semibold text-neutral-900">
                  {extra.salaireBrut === null || extra.salaireBrut === undefined
                    ? '—'
                    : String(extra.salaireBrut)}
                </p>
                <button
                  type="button"
                  onClick={() => openEdit('salaireBrut')}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Mettre à jour
                </button>
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              Les mises à jour utilisent les endpoints PUT du backend. Le corps
              de la requête doit être confirmé via Swagger.
            </p>
          </div>
        )}
      </Modal>

      {/* Edit value modal */}
      <Modal
        open={!!editField}
        title={editField === 'totalPrimes' ? 'Mettre à jour le total des primes' : 'Mettre à jour le salaire brut'}
        onClose={() => setEditField(null)}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditField(null)}>Annuler</Button>
            <Button onClick={handleEditSubmit} disabled={editSubmitting}>
              {editSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mise à jour…
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {editError && (
            <div className="rounded-md border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
              {editError}
            </div>
          )}
          <FormField
            label={editField === 'totalPrimes' ? 'Total des primes' : 'Salaire brut'}
            name="valeur"
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            required
          />
          <p className="text-xs text-neutral-400">
            Le corps de la requête PUT doit être confirmé via Swagger.
          </p>
        </form>
      </Modal>
    </div>
  )
}

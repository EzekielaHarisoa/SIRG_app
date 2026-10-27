import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import AutoTable from '../../components/ui/AutoTable.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import DemandeCongeForm from '../../components/conges/DemandeCongeForm.jsx'
import { useApi } from '../../hooks/useApi.js'
import {
  getAllDemandes,
  getDemandesByEmploye,
  getDemandeById,
  createDemande,
} from '../../services/demandeCongeService.js'

export default function CongesRHPage() {
  const [filters, setFilters] = useState({ matricule: '' })
  const [activeMatricule, setActiveMatricule] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [detailId, setDetailId] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  const fetcher = () =>
    activeMatricule ? getDemandesByEmploye(activeMatricule) : getAllDemandes()
  const { data, error, loading, refetch } = useApi(fetcher, [activeMatricule])

  const handleApply = () => setActiveMatricule(filters.matricule)
  const handleReset = () => {
    setFilters({ matricule: '' })
    setActiveMatricule('')
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    setSubmitError(null)
    setSuccess(false)
    try {
      await createDemande(payload)
      setSuccess(true)
      setShowForm(false)
      refetch()
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDetail = async () => {
    if (!detailId) return
    setDetailLoading(true)
    setDetailError(null)
    setDetail(null)
    try {
      const d = await getDemandeById(detailId)
      setDetail(d)
    } catch (err) {
      setDetailError(err)
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Demandes de congé"
        description="Consultez les demandes, filtrez par employé et consultez le détail d'une demande."
        actions={
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Nouvelle demande
          </Button>
        }
      />

      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Demande créée avec succès.
        </div>
      )}

      <p className="mb-4 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-500">
        Aucun endpoint de validation, refus, modification ou suppression nest disponible. Seules la
        consultation et la création sont possibles.
      </p>

      <div className="mb-4">
        <FilterBar
          filters={[{ name: 'matricule', label: 'Matricule employé', placeholder: 'Ex : 1001' }]}
          value={filters}
          onChange={setFilters}
          onApply={handleApply}
          onReset={handleReset}
          loading={loading}
        />
      </div>

      <AsyncBoundary
        loading={loading}
        error={error}
        data={data}
        onRetry={refetch}
        emptyLabel="Aucune demande trouvée."
      >
        {(rows) => <AutoTable rows={rows} rowKey="id" />}
      </AsyncBoundary>

      <div className="mt-6 rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">Consulter une demande par ID</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-[180px] flex-1">
            <label className="text-sm font-medium text-slate-700">ID de la demande</label>
            <input
              value={detailId}
              onChange={(e) => setDetailId(e.target.value)}
              placeholder="Ex : 5"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <Button variant="primary" onClick={handleDetail} loading={detailLoading}>
            Consulter
          </Button>
        </div>
        {detailError && (
          <p className="mt-3 text-sm text-red-600">{detailError.message || String(detailError)}</p>
        )}
        {detail && (
          <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
            {JSON.stringify(detail, null, 2)}
          </pre>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nouvelle demande de congé" size="lg">
        <DemandeCongeForm onSubmit={handleSubmit} loading={submitting} error={submitError} />
      </Modal>
    </div>
  )
}

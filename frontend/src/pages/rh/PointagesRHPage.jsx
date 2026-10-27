import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import AutoTable from '../../components/ui/AutoTable.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import PointageForm from '../../components/pointages/PointageForm.jsx'
import { useApi } from '../../hooks/useApi.js'
import {
  getAllPointages,
  getPointagesByMatricule,
  getPointagesByDate,
  createPointage,
} from '../../services/pointageService.js'
import { POINTAGE_FIELDS as F } from '../../config/contracts.js'

export default function PointagesRHPage() {
  const [filters, setFilters] = useState({ matricule: '', date: '' })
  const [active, setActive] = useState({ matricule: '', date: '' })
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

  const handleApply = () => setActive({ ...filters })
  const handleReset = () => {
    setFilters({ matricule: '', date: '' })
    setActive({ matricule: '', date: '' })
  }

  const handleSubmit = async (payload) => {
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
    <div>
      <PageHeader
        title="Pointages"
        description="Consultez et filtrez les pointages. Le backend calcule retards et heures supplémentaires."
        actions={
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Nouveau pointage
          </Button>
        }
      />

      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Pointage enregistré avec succès.
        </div>
      )}

      <div className="mb-4">
        <FilterBar
          filters={[
            { name: 'matricule', label: 'Matricule', placeholder: 'Ex : 1001' },
            { name: 'date', label: 'Date', type: 'date' },
          ]}
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
        emptyLabel="Aucun pointage trouvé."
      >
        {(rows) => <AutoTable rows={rows} rowKey="id" />}
      </AsyncBoundary>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Nouveau pointage"
        size="lg"
      >
        <PointageForm
          onSubmit={handleSubmit}
          loading={submitting}
          error={submitError}
          initial={{ [F.numeroMatricule]: filters.matricule, [F.date]: filters.date }}
        />
      </Modal>
    </div>
  )
}

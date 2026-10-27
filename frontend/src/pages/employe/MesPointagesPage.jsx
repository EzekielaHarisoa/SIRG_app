import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import PointageForm from '../../components/pointages/PointageForm.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import AutoTable from '../../components/ui/AutoTable.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import Button from '../../components/ui/Button.jsx'
import { useApi } from '../../hooks/useApi.js'
import {
  getPointagesByMatricule,
  createPointage,
} from '../../services/pointageService.js'
import { POINTAGE_FIELDS as F } from '../../config/contracts.js'

export default function MesPointagesPage() {
  const [matricule, setMatricule] = useState('')
  const [activeMatricule, setActiveMatricule] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const { data, error, loading, refetch } = useApi(
    () => (activeMatricule ? getPointagesByMatricule(activeMatricule) : Promise.resolve([])),
    [activeMatricule],
  )

  const handleFilter = () => {
    setSubmitError(null)
    setActiveMatricule(matricule)
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createPointage(payload)
      setShowForm(false)
      if (!activeMatricule) setActiveMatricule(payload[F.numeroMatricule])
      setMatricule(payload[F.numeroMatricule])
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
        title="Mes pointages"
        description="Consultez vos pointages et enregistrez une nouvelle entrée."
        actions={
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Fermer le formulaire' : 'Nouveau pointage'}
          </Button>
        }
      />

      <p className="mb-4 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-500">
        Lidentité employé nétant pas vérifiée par le backend, saisissez votre matricule pour
        consulter vos propres pointages.
      </p>

      <div className="mb-4">
        <FilterBar
          filters={[{ name: 'matricule', label: 'Matricule', placeholder: 'Ex : 1001' }]}
          value={{ matricule }}
          onChange={(v) => setMatricule(v.matricule)}
          onApply={handleFilter}
          loading={loading}
        />
      </div>

      {showForm && (
        <div className="mb-6 rounded-md border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Nouveau pointage</h2>
          <PointageForm
            onSubmit={handleSubmit}
            loading={submitting}
            error={submitError}
            initial={{ [F.numeroMatricule]: matricule }}
          />
        </div>
      )}

      <AsyncBoundary
        loading={loading}
        error={error}
        data={data}
        onRetry={refetch}
        emptyLabel={activeMatricule ? 'Aucun pointage trouvé pour ce matricule.' : 'Saisissez un matricule pour afficher vos pointages.'}
      >
        {(rows) => <AutoTable rows={rows} rowKey="id" />}
      </AsyncBoundary>
    </div>
  )
}

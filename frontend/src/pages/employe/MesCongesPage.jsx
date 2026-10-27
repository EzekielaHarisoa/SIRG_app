import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import DemandeCongeForm from '../../components/conges/DemandeCongeForm.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import AutoTable from '../../components/ui/AutoTable.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import Button from '../../components/ui/Button.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getDemandesByEmploye, createDemande } from '../../services/demandeCongeService.js'
import { DEMANDE_CONGE_FIELDS as F } from '../../config/contracts.js'

export default function MesCongesPage() {
  const [matricule, setMatricule] = useState('')
  const [activeMatricule, setActiveMatricule] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const { data, error, loading, refetch } = useApi(
    () => (activeMatricule ? getDemandesByEmploye(activeMatricule) : Promise.resolve([])),
    [activeMatricule],
  )

  const handleFilter = () => {
    setSubmitError(null)
    setActiveMatricule(matricule)
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    setSubmitError(null)
    setSuccess(false)
    try {
      await createDemande(payload)
      setSuccess(true)
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
        title="Mes congés"
        description="Consultez vos demandes de congé et créez une nouvelle demande."
        actions={
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Fermer le formulaire' : 'Nouvelle demande'}
          </Button>
        }
      />

      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Demande de congé envoyée avec succès.
        </div>
      )}

      <p className="mb-4 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-500">
        Lidentité employé nétant pas vérifiée par le backend, saisissez votre matricule pour
        consulter vos propres demandes.
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
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Nouvelle demande de congé</h2>
          <DemandeCongeForm
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
        emptyLabel={activeMatricule ? 'Aucune demande trouvée pour ce matricule.' : 'Saisissez un matricule pour afficher vos demandes.'}
      >
        {(rows) => <AutoTable rows={rows} rowKey="id" />}
      </AsyncBoundary>
    </div>
  )
}

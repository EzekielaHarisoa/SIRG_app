import { useState } from 'react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import AsyncBoundary from '../components/ui/AsyncBoundary.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmployeFormModal from '../components/employes/Modal.jsx'
import { useApi } from '../hooks/useApi.js'
import { getAllEmployes, createEmploye, updateEmploye } from '../services/employeService.js'
import { EMPLOYE_FIELDS as F } from '../config/contracts.js'
import { formatCell } from '../utils/format.js'

export default function EmployesPage() {
  const { data, error, loading, refetch } = useApi(() => getAllEmployes(), [])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setSubmitError(null)
    setSuccess(false)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setSubmitError(null)
    setSuccess(false)
    setModalOpen(true)
  }

  const handleSubmit = async (payload, isEdit) => {
    setSubmitting(true)
    setSubmitError(null)
    setSuccess(false)
    try {
      if (isEdit) {
        await updateEmploye(payload[F.numeroMatricule], payload)
      } else {
        await createEmploye(payload)
      }
      setSuccess(true)
      setModalOpen(false)
      refetch()
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { key: F.numeroMatricule, label: 'Matricule' },
    { key: F.nom },
    { key: F.prenom, label: 'Prénom' },
    { key: F.poste },
    { key: F.departement, label: 'Département' },
    { key: F.email },
    {
      key: 'actions',
      label: 'Actions',
      render: (_v, row) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
          Modifier
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Employés"
        description="Gérez les employés : consultation, création et modification."
        actions={<Button variant="primary" onClick={openCreate}>Nouvel employé</Button>}
      />

      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Opération effectuée avec succès.
        </div>
      )}

      <AsyncBoundary
        loading={loading}
        error={error}
        data={data}
        onRetry={refetch}
        emptyLabel="Aucun employé enregistré."
      >
        {(rows) => <DataTable columns={columns} rows={rows} rowKey={F.numeroMatricule} />}
      </AsyncBoundary>

      <EmployeFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        loading={submitting}
        error={submitError}
      />
    </div>
  )
}

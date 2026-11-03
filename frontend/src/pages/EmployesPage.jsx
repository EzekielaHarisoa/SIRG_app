import { useState } from 'react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmployeFormModal from '../components/employes/Modal.jsx'
import { useApi } from '../hooks/useApi.js'
import { getAllEmployes, createEmploye, updateEmploye } from '../services/employeService.js'
import { EMPLOYE_FIELDS as F } from '../config/contracts.js'

export default function EmployesPage() {
  const { data, error, loading, refetch } = useApi(() => getAllEmployes(), [])

  const rows = Array.isArray(data) ? data : []
console.log("Données reçues :", data)
console.log("Est un tableau :", Array.isArray(data))
console.log("Nombre d'employés :", rows.length)
console.log("Erreur :", error)
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
  { key: F.nomEtPrenoms, label: 'Nom et prénoms' },
  { key: F.telephone, label: 'Téléphone' },
  { key: F.adresse, label: 'Adresse' },
  { key: F.dateEmbauche, label: "Date d'embauche"},
  { key: F.entrepriseId, label: 'Entreprise' },
  { key: F.posteId, label: 'Poste' },
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

  if (loading) {
    return (
      <div className="flex items-center gap-3 border border-slate-200 bg-white px-4 py-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-500" />
        <p className="text-sm text-slate-600">Chargement de la liste des employés…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm">
        <p className="font-medium text-red-800">Impossible d'afficher les employés</p>
        <p className="mt-1 text-red-700">{error.message || 'Erreur inconnue.'}</p>
        <Button variant="secondary" className="mt-3" onClick={refetch}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employés"
        description="Gérez les employés : consultation, création et modification."
        actions={<Button variant="primary" onClick={openCreate}>Nouvel employé</Button>}
      />

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Opération effectuée avec succès.
        </div>
      )}

      <div className="min-w-0">
        {Array.isArray(rows) && rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm text-slate-500">Aucun employé enregistré.</p>
            <p className="mt-1 text-xs text-slate-400">
              Utilisez le bouton « Nouvel employé » pour en créer un.
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={F.numeroMatricule}
            emptyLabel="Aucun employé enregistré."
          />
        )}
      </div>

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

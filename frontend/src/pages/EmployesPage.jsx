import { useMemo, useState } from 'react'
import { Users, Plus, Pencil, Loader2 } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { employeService } from '../services/employeService'
import Button from '../components/ui/Button'
import DataTable from '../components/ui/DataTable'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'

/**
 * Employés page.
 *
 * Connected to the real employe-controller endpoints:
 *   GET  /employe                    — list
 *   POST /employe                    — create
 *   PUT  /employe/{numeroMatricule}  — update
 *
 * No DELETE endpoint exists, so no delete action is offered.
 *
 * ⚠️ The create/edit form fields below are based on common employé properties.
 * Confirm the exact request schema against Swagger (/swagger-ui/index.html) and
 * adjust the FIELD_DEFS array accordingly.
 */
const FIELD_DEFS = [
  { name: 'numeroMatricule', label: 'Numéro matricule', required: true },
  { name: 'nom', label: 'Nom', required: true },
  { name: 'prenom', label: 'Prénom', required: true },
  { name: 'poste', label: 'Poste' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'telephone', label: 'Téléphone' },
  { name: 'dateEmbauche', label: "Date d'embauche", type: 'date' },
]

function emptyForm() {
  return FIELD_DEFS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})
}

export default function EmployesPage() {
  const { data, error, loading, refetch } = useApi(() => employeService.list(), [])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const rows = Array.isArray(data) ? data : []

  // Build columns dynamically from the first row's keys, plus an actions column.
  const columns = useMemo(() => {
    if (rows.length === 0) return []
    const keys = Object.keys(rows[0])
    const cols = keys.map((key) => ({
      key,
      header: key,
      className: key === keys[0] ? 'font-medium text-neutral-900' : '',
    }))
    cols.push({
      key: '__actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-primary-600"
          aria-label="Modifier"
          onClick={() => openEdit(row)}
        >
          <Pencil className="h-4 w-4" />
        </button>
      ),
    })
    return cols
  }, [rows])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setSubmitError(null)
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditing(row)
    setForm(FIELD_DEFS.reduce((acc, f) => ({ ...acc, [f.name]: row[f.name] ?? '' }), {}))
    setSubmitError(null)
    setModalOpen(true)
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
      if (editing) {
        const matricule = editing.numeroMatricule ?? editing.matricule
        await employeService.update(matricule, form)
      } else {
        await employeService.create(form)
      }
      setModalOpen(false)
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
          <h2 className="text-xl font-semibold text-neutral-900">Employés</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Gérez les employés enregistrés dans le système.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouvel employé
        </Button>
      </div>

      {loading && <LoadingState message="Chargement des employés…" />}

      {error && (
        <ErrorState
          title="Erreur de chargement"
          message="Les employés n'ont pas pu être chargés depuis le backend."
          onRetry={refetch}
        />
      )}

      {!loading && !error && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.numeroMatricule ?? row.matricule ?? row.id}
          empty={
            <EmptyState
              icon={Users}
              title="Aucun employé disponible"
              message="Aucun employé n'a été trouvé. Ajoutez un employé pour commencer."
              action={
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Nouvel employé
                </Button>
              }
            />
          }
        />
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Modifier l'employé" : 'Nouvel employé'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement…
                </>
              ) : editing ? (
                'Enregistrer'
              ) : (
                'Créer'
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
                disabled={editing && f.name === 'numeroMatricule'}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-400">
            Les champs exacts doivent être confirmés via Swagger. Ajustez
            FIELD_DEFS selon le schéma réel du backend.
          </p>
        </form>
      </Modal>
    </div>
  )
}

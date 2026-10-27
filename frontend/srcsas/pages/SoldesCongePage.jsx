import { useState } from 'react'
import { Wallet, Plus, Loader2, Pencil } from 'lucide-react'
import { soldeCongeService } from '../services/soldeCongeService'
import Button from '../components/ui/Button'
import LoadingState from '../components/ui/LoadingState'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import Modal from '../components/ui/Modal'
import FormField from '../components/ui/FormField'

/**
 * Soldes de congé page — connected to solde-conge-controller.
 *
 *   GET /soldeConge/{numeroMatricule}        — solde for an employé
 *   GET /soldeConge/{numeroMatricule}/{anne} — solde for a given year
 *   POST /soldeConge                          — create a solde
 *   PUT  /soldeConge                          — update a solde
 *
 * The list endpoint is per-matricule, so the page is search-driven: the user
 * enters a matricule (and optionally a year) to consult a solde. A create/edit
 * modal is provided.
 *
 * NOTE: the path parameter is named `anne` as declared in the backend.
 * ⚠️ Confirm the request/response schema via Swagger, then adjust FIELD_DEFS.
 */
const FIELD_DEFS = [
  { name: 'numeroMatricule', label: 'Numéro matricule', required: true },
  { name: 'annee', label: 'Année', type: 'number', required: true },
  { name: 'joursTotal', label: 'Jours total', type: 'number' },
  { name: 'joursPris', label: 'Jours pris', type: 'number' },
  { name: 'joursRestants', label: 'Jours restants', type: 'number' },
]

function emptyForm() {
  return FIELD_DEFS.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})
}

export default function SoldesCongePage() {
  const [matricule, setMatricule] = useState('')
  const [annee, setAnnee] = useState('')
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState(null) // { data, error }
  const [hasSearched, setHasSearched] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  async function handleSearch(e) {
    e?.preventDefault()
    if (!matricule.trim()) return
    setSearching(true)
    setResult(null)
    setHasSearched(true)
    try {
      const data = annee
        ? await soldeCongeService.getByMatriculeAndYear(matricule.trim(), annee)
        : await soldeCongeService.getByMatricule(matricule.trim())
      setResult({ data, error: null })
    } catch (err) {
      setResult({ data: null, error: err })
    } finally {
      setSearching(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyForm(), numeroMatricule: matricule })
    setSubmitError(null)
    setModalOpen(true)
  }

  function openEdit() {
    if (!result?.data) return
    const row = Array.isArray(result.data) ? result.data[0] : result.data
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
        await soldeCongeService.update(form)
      } else {
        await soldeCongeService.create(form)
      }
      setModalOpen(false)
      if (matricule.trim()) handleSearch()
    } catch (err) {
      setSubmitError(err.message || "L'enregistrement a échoué.")
    } finally {
      setSubmitting(false)
    }
  }

  // Render the solde result (object or array) as key/value rows.
  const soldeRows = (() => {
    if (!result?.data) return []
    const arr = Array.isArray(result.data) ? result.data : [result.data]
    return arr
  })()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Soldes de congé</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Consultez le solde de congé d'un employé par matricule et année.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nouveau solde
        </Button>
      </div>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-700">Numéro matricule *</label>
          <input
            type="text"
            value={matricule}
            onChange={(e) => setMatricule(e.target.value)}
            placeholder="ex. 12345"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-neutral-700">Année (optionnel)</label>
          <input
            type="number"
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
            placeholder="ex. 2026"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button type="submit" disabled={searching || !matricule.trim()}>
          {searching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Recherche…
            </>
          ) : (
            'Consulter'
          )}
        </Button>
      </form>

      {/* Results */}
      {searching && <LoadingState message="Chargement du solde…" />}

      {!searching && result?.error && (
        <ErrorState
          title="Solde indisponible"
          message={result.error.message || "Le solde n'a pas pu être chargé."}
          onRetry={handleSearch}
        />
      )}

      {!searching && !result?.error && hasSearched && soldeRows.length > 0 && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  {Object.keys(soldeRows[0]).map((key) => (
                    <th key={key} scope="col" className="px-4 py-3">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {soldeRows.map((row, i) => (
                  <tr key={i} className="hover:bg-neutral-50">
                    {Object.keys(soldeRows[0]).map((key) => (
                      <td key={key} className="px-4 py-3 text-neutral-700">
                        {row[key] === null || row[key] === undefined ? '—' : String(row[key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <Button variant="secondary" onClick={openEdit}>
              <Pencil className="h-4 w-4" />
              Modifier le solde
            </Button>
          </div>
        </div>
      )}

      {!searching && !result?.error && hasSearched && soldeRows.length === 0 && (
        <EmptyState
          icon={Wallet}
          title="Aucun solde trouvé"
          message={`Aucun solde de congé trouvé pour le matricule « ${matricule} »${annee ? ` en ${annee}` : ''}.`}
        />
      )}

      {!hasSearched && (
        <EmptyState
          icon={Wallet}
          title="Recherchez un solde"
          message="Saisissez un numéro matricule pour consulter le solde de congé correspondant."
        />
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Modifier le solde' : 'Nouveau solde de congé'}
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
                disabled={editing && f.name !== 'joursRestants' && f.name !== 'joursPris' && f.name !== 'joursTotal'}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-400">
            Les champs exacts doivent être confirmés via Swagger.
          </p>
        </form>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import FormField from '../ui/FormField.jsx'
import Button from '../ui/Button.jsx'
import { POINTAGE_FIELDS as F } from '../../config/contracts.js'

const EMPTY = {
  [F.numeroMatricule]: '',
  [F.heureEntree]: '',
  [F.heureSortie]: '',
}

/**
 * PointageForm — manual entry reserved for the RH desk.
 *
 * The backend expects ISO local date-times (heureEntree / heureSortie) plus the
 * matching datePointage; retard and heures supplémentaires are computed there.
 */
export default function PointageForm({
  onSubmit,
  loading,
  error,
  initial,
  submitLabel = 'Enregistrer',
}) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }))
  const [erreurLocale, setErreurLocale] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (loading) return

    const entree = form[F.heureEntree]
    const sortie = form[F.heureSortie]

    if (!entree || !sortie) {
      setErreurLocale('L’heure d’entrée et l’heure de sortie sont obligatoires.')
      return
    }

    if (sortie <= entree) {
      setErreurLocale('L’heure de sortie doit être postérieure à l’heure d’entrée.')
      return
    }

    setErreurLocale('')
    onSubmit({
      [F.numeroMatricule]: Number(form[F.numeroMatricule]),
      [F.heureEntree]: entree,
      [F.heureSortie]: sortie,
      // Same calendar day as the entry, as required by PointageService.
      [F.datePointage]: entree.slice(0, 10),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        label="Matricule"
        name={F.numeroMatricule}
        type="number"
        value={form[F.numeroMatricule]}
        onChange={handleChange}
        required
      />
      <FormField
        label="Entrée"
        name={F.heureEntree}
        type="datetime-local"
        value={form[F.heureEntree]}
        onChange={handleChange}
        required
      />
      <FormField
        label="Sortie"
        name={F.heureSortie}
        type="datetime-local"
        value={form[F.heureSortie]}
        onChange={handleChange}
        required
      />

      {(erreurLocale || error) && (
        <p className="col-span-full text-sm text-red-600">
          {erreurLocale || error?.message || String(error)}
        </p>
      )}

      <div className="col-span-full flex justify-end">
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

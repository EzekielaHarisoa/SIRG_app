import { useState } from 'react'
import FormField from '../ui/FormField.jsx'
import Button from '../ui/Button.jsx'
import { POINTAGE_FIELDS as F } from '../../config/contracts.js'

const EMPTY = {
  [F.numeroMatricule]: '',
  [F.date]: '',
  [F.heureArrivee]: '',
  [F.heureDepart]: '',
}

export default function PointageForm({ onSubmit, loading, error, initial, submitLabel = 'Enregistrer' }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }))

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField
        label="Matricule"
        name={F.numeroMatricule}
        value={form[F.numeroMatricule]}
        onChange={handleChange}
        required
      />
      <FormField
        label="Date"
        name={F.date}
        type="date"
        value={form[F.date]}
        onChange={handleChange}
        required
      />
      <FormField
        label="Heure d'arrivée"
        name={F.heureArrivee}
        type="time"
        value={form[F.heureArrivee]}
        onChange={handleChange}
      />
      <FormField
        label="Heure de départ"
        name={F.heureDepart}
        type="time"
        value={form[F.heureDepart]}
        onChange={handleChange}
      />
      {error && (
        <p className="col-span-full text-sm text-red-600">{error.message || String(error)}</p>
      )}
      <div className="col-span-full flex justify-end">
        <Button type="submit" variant="primary" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

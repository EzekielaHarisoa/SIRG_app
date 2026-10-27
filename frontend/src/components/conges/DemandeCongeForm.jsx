import { useState } from 'react'
import FormField from '../ui/FormField.jsx'
import Button from '../ui/Button.jsx'
import { DEMANDE_CONGE_FIELDS as F } from '../../config/contracts.js'

const EMPTY = {
  [F.numeroMatricule]: '',
  [F.dateDebut]: '',
  [F.dateFin]: '',
  [F.typeConge]: '',
  [F.motif]: '',
}

const TYPE_OPTIONS = [
  { value: 'ANNUEL', label: 'Congé annuel' },
  { value: 'MALADIE', label: 'Congé maladie' },
  { value: 'EXCEPTIONNEL', label: 'Congé exceptionnel' },
  { value: 'SANS_SOLDE', label: 'Congé sans solde' },
]

export default function DemandeCongeForm({ onSubmit, loading, error, initial, submitLabel = 'Envoyer la demande' }) {
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
        label="Type de congé"
        name={F.typeConge}
        value={form[F.typeConge]}
        onChange={handleChange}
        options={TYPE_OPTIONS}
        required
      />
      <FormField
        label="Date de début"
        name={F.dateDebut}
        type="date"
        value={form[F.dateDebut]}
        onChange={handleChange}
        required
      />
      <FormField
        label="Date de fin"
        name={F.dateFin}
        type="date"
        value={form[F.dateFin]}
        onChange={handleChange}
        required
      />
      <div className="col-span-full">
        <FormField
          label="Motif"
          name={F.motif}
          value={form[F.motif]}
          onChange={handleChange}
          rows={3}
        />
      </div>
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

import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import FormField from '../ui/FormField.jsx'
import Button from '../ui/Button.jsx'
import { EMPLOYE_FIELDS as F } from '../../config/contracts.js'

const EMPTY = {
  [F.numeroMatricule]: '',
  [F.nom]: '',
  [F.prenom]: '',
  [F.email]: '',
  [F.telephone]: '',
  [F.dateEmbauche]: '',
  [F.poste]: '',
  [F.salaireBase]: '',
  [F.departement]: '',
}

export default function EmployeFormModal({ open, onClose, onSubmit, initial, loading, error }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }))
  const isEdit = !!initial?.[F.numeroMatricule]

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...form }
    if (payload[F.salaireBase] !== '') {
      const num = parseFloat(payload[F.salaireBase])
      payload[F.salaireBase] = Number.isNaN(num) ? payload[F.salaireBase] : num
    }
    onSubmit(payload, isEdit)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier un employé' : 'Créer un employé'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          label="Matricule"
          name={F.numeroMatricule}
          value={form[F.numeroMatricule]}
          onChange={handleChange}
          required
          disabled={isEdit}
          hint={isEdit ? 'Non modifiable' : undefined}
        />
        <FormField
          label="Nom"
          name={F.nom}
          value={form[F.nom]}
          onChange={handleChange}
          required
        />
        <FormField
          label="Prénom"
          name={F.prenom}
          value={form[F.prenom]}
          onChange={handleChange}
          required
        />
        <FormField
          label="Email"
          name={F.email}
          type="email"
          value={form[F.email]}
          onChange={handleChange}
        />
        <FormField
          label="Téléphone"
          name={F.telephone}
          type="tel"
          value={form[F.telephone]}
          onChange={handleChange}
        />
        <FormField
          label="Date d'embauche"
          name={F.dateEmbauche}
          type="date"
          value={form[F.dateEmbauche]}
          onChange={handleChange}
        />
        <FormField
          label="Poste"
          name={F.poste}
          value={form[F.poste]}
          onChange={handleChange}
        />
        <FormField
          label="Département"
          name={F.departement}
          value={form[F.departement]}
          onChange={handleChange}
        />
        <FormField
          label="Salaire de base"
          name={F.salaireBase}
          type="number"
          value={form[F.salaireBase]}
          onChange={handleChange}
        />
        {error && (
          <p className="col-span-full text-sm text-red-600">{error.message || String(error)}</p>
        )}
      </form>
    </Modal>
  )
}

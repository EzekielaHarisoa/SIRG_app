import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import FormField from '../../components/ui/FormField.jsx'
import Button from '../../components/ui/Button.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import Modal from '../../components/ui/Modal.jsx'
import {
  getSoldeByMatricule,
  getSoldeByMatriculeAndYear,
  createSolde,
  updateSolde,
} from '../../services/soldeCongeService.js'
import { SOLDE_CONGE_FIELDS as F } from '../../config/contracts.js'

const EMPTY_FORM = {
  [F.numeroMatricule]: '',
  [F.anne]: '',
  [F.soldeAnnuel]: '',
  [F.soldeMaladie]: '',
  [F.joursPris]: '',
}

export default function SoldesRHPage() {
  const [matricule, setMatricule] = useState('')
  const [annee, setAnnee] = useState('')
  const [solde, setSolde] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [isEdit, setIsEdit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [success, setSuccess] = useState(false)

  const load = async (e) => {
    e?.preventDefault()
    if (!matricule) return
    setLoading(true)
    setError(null)
    setSolde(null)
    try {
      const data = annee
        ? await getSoldeByMatriculeAndYear(matricule, annee)
        : await getSoldeByMatricule(matricule)
      setSolde(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setIsEdit(false)
    setForm({ ...EMPTY_FORM, [F.numeroMatricule]: matricule, [F.anne]: annee })
    setSubmitError(null)
    setSuccess(false)
    setModalOpen(true)
  }

  const openEdit = () => {
    if (!solde) return
    setIsEdit(true)
    setForm({
      [F.numeroMatricule]: solde[F.numeroMatricule] ?? matricule,
      [F.anne]: solde[F.anne] ?? annee,
      [F.soldeAnnuel]: solde[F.soldeAnnuel] ?? '',
      [F.soldeMaladie]: solde[F.soldeMaladie] ?? '',
      [F.joursPris]: solde[F.joursPris] ?? '',
    })
    setSubmitError(null)
    setSuccess(false)
    setModalOpen(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    setSuccess(false)
    const payload = { ...form }
    for (const k of [F.soldeAnnuel, F.soldeMaladie, F.joursPris, F.anne]) {
      if (payload[k] !== '') {
        const num = Number(payload[k])
        payload[k] = Number.isNaN(num) ? payload[k] : num
      }
    }
    try {
      if (isEdit) {
        await updateSolde(payload)
      } else {
        await createSolde(payload)
      }
      setSuccess(true)
      setModalOpen(false)
      if (matricule) load()
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Soldes de congé"
        description="Recherchez, consultez, créez et modifiez les soldes de congé par matricule."
      />

      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Opération effectuée avec succès.
        </div>
      )}

      <form onSubmit={load} className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-white p-4">
        <div className="min-w-[180px] flex-1">
          <FormField label="Matricule" name="matricule" value={matricule} onChange={(e) => setMatricule(e.target.value)} required />
        </div>
        <div className="min-w-[140px] flex-1">
          <FormField label="Année (optionnel)" name="annee" type="number" value={annee} onChange={(e) => setAnnee(e.target.value)} placeholder="Ex : 2026" />
        </div>
        <Button type="submit" variant="primary" loading={loading}>
          Rechercher
        </Button>
        <Button variant="secondary" onClick={openCreate}>
          Créer un solde
        </Button>
        {solde && (
          <Button variant="secondary" onClick={openEdit}>
            Modifier
          </Button>
        )}
      </form>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error.message || String(error)}
        </div>
      )}

      {solde && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Solde annuel" value={solde[F.soldeAnnuel]} />
          <StatCard label="Solde maladie" value={solde[F.soldeMaladie]} />
          <StatCard label="Jours pris" value={solde[F.joursPris]} />
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Modifier un solde' : 'Créer un solde'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Matricule" name={F.numeroMatricule} value={form[F.numeroMatricule]} onChange={handleChange} required disabled={isEdit} />
          <FormField label="Année" name={F.anne} type="number" value={form[F.anne]} onChange={handleChange} required disabled={isEdit} />
          <FormField label="Solde annuel" name={F.soldeAnnuel} type="number" value={form[F.soldeAnnuel]} onChange={handleChange} />
          <FormField label="Solde maladie" name={F.soldeMaladie} type="number" value={form[F.soldeMaladie]} onChange={handleChange} />
          <FormField label="Jours pris" name={F.joursPris} type="number" value={form[F.joursPris]} onChange={handleChange} />
          {submitError && (
            <p className="col-span-full text-sm text-red-600">{submitError.message || String(submitError)}</p>
          )}
          <div className="col-span-full flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import FormField from '../../components/ui/FormField.jsx'
import BulletinDetailPage from '../../components/paie/BulletinDetailPage.jsx'
import { useApi } from '../../hooks/useApi.js'
import {
  getAllBulletins,
  getBulletinById,
  createBulletin,
  updateTotalPrimes,
  updateSalaireBrut,
} from '../../services/bulletinPaieService.js'
import { BULLETIN_FIELDS as F } from '../../config/contracts.js'
import { formatCell, formatMontant, monthLabel } from '../../utils/format.js'
import { printBulletin } from '../../utils/print.js'

const EMPTY_FORM = {
  [F.numeroMatricule]: '',
  [F.mois]: '',
  [F.anne]: '',
  [F.salaireBase]: '',
}

export default function BulletinsPage() {
  const { data, error, loading, refetch } = useApi(() => getAllBulletins(), [])
  const [detailId, setDetailId] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [success, setSuccess] = useState(false)

  // montant update modal
  const [montantModal, setMontantModal] = useState(null) // { kind: 'primes'|'brut', id }
  const [montantValue, setMontantValue] = useState('')
  const [montantLoading, setMontantLoading] = useState(false)
  const [montantError, setMontantError] = useState(null)

  const handleCreateChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)
    setSuccess(false)
    const payload = { ...form }
    if (payload[F.salaireBase] !== '') {
      const num = parseFloat(payload[F.salaireBase])
      payload[F.salaireBase] = Number.isNaN(num) ? payload[F.salaireBase] : num
    }
    if (payload[F.mois] !== '') payload[F.mois] = Number(payload[F.mois])
    if (payload[F.anne] !== '') payload[F.anne] = Number(payload[F.anne])
    try {
      await createBulletin(payload)
      setSuccess(true)
      setCreateOpen(false)
      setForm({ ...EMPTY_FORM })
      refetch()
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const openMontant = (kind, id) => {
    setMontantModal({ kind, id })
    setMontantValue('')
    setMontantError(null)
  }

  const handleMontantSubmit = async (e) => {
    e.preventDefault()
    if (!montantModal) return
    setMontantLoading(true)
    setMontantError(null)
    const num = parseFloat(montantValue)
    if (Number.isNaN(num)) {
      setMontantError({ message: 'Veuillez saisir un montant valide.' })
      setMontantLoading(false)
      return
    }
    try {
      if (montantModal.kind === 'primes') {
        await updateTotalPrimes(montantModal.id, num)
      } else {
        await updateSalaireBrut(montantModal.id, num)
      }
      setMontantModal(null)
      refetch()
    } catch (err) {
      setMontantError(err)
    } finally {
      setMontantLoading(false)
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { key: F.numeroMatricule, label: 'Matricule' },
    { key: F.mois, label: 'Mois', render: (v) => monthLabel(v) },
    { key: F.anne, label: 'Année' },
    { key: F.salaireBase, label: 'Salaire base', render: (v) => formatMontant(v) },
    { key: F.salaireBrut, label: 'Salaire brut', render: (v) => formatMontant(v) },
    { key: F.totalPrimes, label: 'Total primes', render: (v) => formatMontant(v) },
    {
      key: 'actions',
      label: 'Actions',
      render: (_v, row) => (
        <div className="flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDetailId(row.id)}>
            Détail
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openMontant('primes', row.id)}>
            Primes
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openMontant('brut', row.id)}>
            Brut
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Bulletins de paie"
        description="Consultez, créez et mettez à jour les bulletins. Les règles métier restent côté backend."
        actions={<Button variant="primary" onClick={() => setCreateOpen(true)}>Nouveau bulletin</Button>}
      />

      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Bulletin créé avec succès.
        </div>
      )}

      <AsyncBoundary
        loading={loading}
        error={error}
        data={data}
        onRetry={refetch}
        emptyLabel="Aucun bulletin trouvé."
      >
        {(rows) => <DataTable columns={columns} rows={rows} rowKey="id" />}
      </AsyncBoundary>

      <Modal open={detailId != null} onClose={() => setDetailId(null)} title="Détail du bulletin" size="lg">
        {detailId != null && <BulletinDetailPage bulletinId={detailId} onPrint={printBulletin} />}
      </Modal>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouveau bulletin" size="md">
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Matricule" name={F.numeroMatricule} value={form[F.numeroMatricule]} onChange={handleCreateChange} required />
          <FormField label="Mois (1-12)" name={F.mois} type="number" value={form[F.mois]} onChange={handleCreateChange} required />
          <FormField label="Année" name={F.anne} type="number" value={form[F.anne]} onChange={handleCreateChange} required />
          <FormField label="Salaire de base" name={F.salaireBase} type="number" value={form[F.salaireBase]} onChange={handleCreateChange} />
          {submitError && (
            <p className="col-span-full text-sm text-red-600">{submitError.message || String(submitError)}</p>
          )}
          <div className="col-span-full flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)} disabled={submitting}>Annuler</Button>
            <Button type="submit" variant="primary" loading={submitting}>Créer</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!montantModal}
        onClose={() => setMontantModal(null)}
        title={montantModal?.kind === 'primes' ? 'Mettre à jour le total des primes' : 'Mettre à jour le salaire brut'}
        size="sm"
      >
        <form onSubmit={handleMontantSubmit} className="space-y-4">
          <FormField
            label="Nouveau montant"
            name="montant"
            type="number"
            value={montantValue}
            onChange={(e) => setMontantValue(e.target.value)}
            required
          />
          {montantError && (
            <p className="text-sm text-red-600">{montantError.message || String(montantError)}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setMontantModal(null)} disabled={montantLoading}>Annuler</Button>
            <Button type="submit" variant="primary" loading={montantLoading}>Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { useApi } from '../../hooks/useApi.js'
import {
  getPrimesByEmploye,
  getPrimesByBulletin,
  getPrimes,
  createPrime,
  updatePrime,
  deletePrime,
  associatePrimeToBulletin,
  disassociatePrimeFromBulletin,
} from '../../services/bulletinPaieService.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import Modal from '../../components/ui/Modal.jsx'
import FormField from '../../components/ui/FormField.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import { formatMontant, formatCell } from '../../utils/format.js'
import { ApiError } from '../../services/api.js'

const EMPTY_PRIME = {
  libelle: '',
  montant: '',
}

const EMPTY_BULLETIN = {
  id: '',
}

export default function PrimeManagementPage() {
  const [tab, setTab] = useState('employe')

  const { data: primes, error: primeError, loading: primeLoading, refetch: primeRefetch } = useApi(
    () => getPrimes(),
    [tab],
  )

  const [selectedPrimeId, setSelectedPrimeId] = useState(null)
  const [primeDetails, setPrimeDetails] = useState(null)

  const [primeForm, setPrimeForm] = useState({ ...EMPTY_PRIME })
  const [primeSubmitting, setPrimeSubmitting] = useState(false)
  const [primeSubmitError, setPrimeSubmitError] = useState(null)
  const [assocOpen, setAssocOpen] = useState(false)
  const [assocError, setAssocError] = useState(null)
  const [assigning, setAssigning] = useState(false)

  const loadPrimes = async (id) => {
    const [p, bs] = await Promise.all([getPrimes(), getPrimesByBulletin(id)])
    return { prime: p, bulletins: bs || [] }
  }

  const { prime: primeA, bulletins: bulletinsA } = useApi(() => {
    if (!primeDetails) return Promise.resolve({ prime: null, bulletins: [] })
    return loadPrimes(primeDetails.id)
  }, [primeDetails?.id])

  const handlePrimeChange = (e) => {
    const { name, value } = e.target
    setPrimeForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePrimeSubmit = async (e) => {
    e.preventDefault()
    setPrimeSubmitting(true)
    setPrimeSubmitError(null)
    const payload = {
      ...primeForm,
      montant: parseFloat(primeForm.montant),
      numeroMatricule: parseInt(primeForm.numeroMatricule, 10),
    }
    if (primeForm.libelle === '') {
      setPrimeSubmitError({ message: 'Le libellé est obligatoire.' })
      setPrimeSubmitting(false)
      return
    }
    if (Number.isNaN(payload.montant) || payload.montant < 0) {
      setPrimeSubmitError({ message: 'Le montant doit être positif.' })
      setPrimeSubmitting(false)
      return
    }
    try {
      if (selectedPrimeId != null) {
        await updatePrime(selectedPrimeId, payload)
        setSelectedPrimeId(null)
        setPrimeDetails(null)
      } else {
        await createPrime(payload)
      }
      setPrimeForm({ ...EMPTY_PRIME })
      setPrimeDetails(null)
      primeRefetch()
    } catch (err) {
      setPrimeSubmitError(err)
    } finally {
      setPrimeSubmitting(false)
    }
  }

  const handlePrimeDelete = async (id) => {
    try {
      await deletePrime(id)
      setSelectedPrimeId(null)
      setPrimeDetails(null)
      primeRefetch()
    } catch (err) {
      setPrimeSubmitError(err)
    }
  }

  const handleAssociation = async (primeId, bulletinId) => {
    setAssocError(null)
    setAssigning(true)
    try {
      await associatePrimeToBulletin(primeId, bulletinId)
      setAssocOpen(false)
      primeRefetch()
      primeDetails && setPrimeDetails(primeA)
    } catch (err) {
      setAssocError(err)
    } finally {
      setAssigning(false)
    }
  }

  const handleDésassociation = async (primeId) => {
    try {
      await disassociatePrimeFromBulletin(primeId)
      primeRefetch()
      primeDetails && setPrimeDetails(primeA)
    } catch (err) {
      setAssocError(err)
    }
  }

  const primeColumns = [
    { key: 'id', label: 'ID' },
    {
      key: 'libelle',
      label: 'Libellé',
      render: (v) => formatCell(v),
    },
    {
      key: 'montant',
      label: 'Montant',
      render: (v) => formatMontant(v),
    },
    {
      key: 'numeroMatricule',
      label: 'Matricule',
      render: (v) => formatCell(v),
    },
    {
      key: 'bulletinPaieId',
      label: 'Bulletin',
      render: (v) => (v ? formatCell(v) : '—'),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Gestion des primes"
        description="Créez, modifiez et associez les primes aux bulletins."
      />

      <div className="mt-4 flex gap-2">
        <Button
          variant={tab === 'employe' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTab('employe')}
        >
          Par employé
        </Button>
        <Button
          variant={tab === 'bulletin' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setTab('bulletin')}
        >
          Par bulletin
        </Button>
        <Button variant="primary" onClick={() => setAssocOpen(true)}>
          Nouvelle prime
        </Button>
      </div>

      <AsyncBoundary
        loading={primeLoading}
        error={primeError}
        data={primes}
        onRetry={primeRefetch}
        emptyLabel="Aucune prime trouvée."
      >
        {(rows) => (
          <DataTable
            columns={primeColumns}
            rows={rows}
            rowKey="id"
            onRowClick={(row) => {
              setSelectedPrimeId(row.id)
              setPrimeDetails(row)
            }}
          />
        )}
      </AsyncBoundary>

      <Modal
        open={!!selectedPrimeId}
        onClose={() => {
          setSelectedPrimeId(null)
          setPrimeDetails(null)
        }}
        title="Détail de la prime"
        size="sm"
      >
        {primeDetails && (
          <div className="space-y-3">
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-800">{primeDetails.libelle}</p>
              <p className="text-sm text-slate-600">{formatMontant(primeDetails.montant)}</p>
              <p className="text-sm text-slate-600">Matricule : {formatCell(primeDetails.numeroMatricule)}</p>
              <p className="text-sm text-slate-600">
                Bulletin : {primeDetails.bulletinPaieId ? formatCell(primeDetails.bulletinPaieId) : '—'}
              </p>
            </div>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedPrimeId(null)
                  setPrimeDetails(null)
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={assocOpen}
        onClose={() => {
          setAssocOpen(false)
          setAssocError(null)
        }}
        title="Associer une prime à un bulletin"
        size="md"
      >
        <div className="space-y-4">
          {assocError && (
            <p className="text-sm text-red-600">{assocError.message || String(assocError)}</p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField
              label="Prime"
              name="primeId"
              as="select"
              value={primeDetails?.id || ''}
              onChange={(e) => {
                const id = e.target.value
                const p = primeA || (buttons => buttons.find((b) => b.id === id))
                setPrimeDetails(p || null)
              }}
              required
            >
              <option value="">Sélectionner une prime</option>
              {(primes || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.libelle} — {formatMontant(p.montant)}
                </option>
              ))}
            </FormField>

            <FormField
              label="Bulletin"
              name="bulletinId"
              as="select"
              value={primeDetails?.bulletinPaieId || ''}
              onChange={(e) => {
                setPrimeDetails((prev) => (prev ? { ...prev, bulletinPaieId: e.target.value } : prev))
              }}
              required
            >
              <option value="">Sélectionner un bulletin</option>
              {(bulletins || []).map((b) => (
                <option key={b.id} value={b.id}>
                  Bulletin #{b.id} — matricule {formatCell(b.numeroMatricule)}
                </option>
              ))}
            </FormField>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setAssocOpen(false)
                setPrimeDetails(null)
              }}
              disabled={assigning}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (!primeDetails) return
                handleAssociation(primeDetails.id, primeDetails.bulletinPaieId)
              }}
              loading={assigning}
            >
              Associer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

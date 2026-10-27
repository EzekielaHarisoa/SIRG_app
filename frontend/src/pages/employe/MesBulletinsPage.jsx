import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import AutoTable from '../../components/ui/AutoTable.jsx'
import FilterBar from '../../components/ui/FilterBar.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import BulletinDetailPage from '../../components/paie/BulletinDetailPage.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getBulletinsByEmploye } from '../../services/bulletinPaieService.js'
import { printBulletin } from '../../utils/print.js'

export default function MesBulletinsPage() {
  const [matricule, setMatricule] = useState('')
  const [activeMatricule, setActiveMatricule] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const { data, error, loading, refetch } = useApi(
    () => (activeMatricule ? getBulletinsByEmploye(activeMatricule) : Promise.resolve([])),
    [activeMatricule],
  )

  const handleFilter = () => setActiveMatricule(matricule)

  return (
    <div>
      <PageHeader
        title="Mes bulletins de paie"
        description="Consultez vos bulletins de paie par matricule."
      />

      <p className="mb-4 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-500">
        Lidentité employé nétant pas vérifiée par le backend, saisissez votre matricule pour
        consulter vos propres bulletins.
      </p>

      <div className="mb-4">
        <FilterBar
          filters={[{ name: 'matricule', label: 'Matricule', placeholder: 'Ex : 1001' }]}
          value={{ matricule }}
          onChange={(v) => setMatricule(v.matricule)}
          onApply={handleFilter}
          loading={loading}
        />
      </div>

      <AsyncBoundary
        loading={loading}
        error={error}
        data={data}
        onRetry={refetch}
        emptyLabel={activeMatricule ? 'Aucun bulletin trouvé pour ce matricule.' : 'Saisissez un matricule pour afficher vos bulletins.'}
      >
        {(rows) => (
          <AutoTable
            rows={rows}
            rowKey="id"
            hideKeys={['lignes', 'primes']}
            emptyLabel="Aucun bulletin."
          />
        )}
      </AsyncBoundary>

      {data && Array.isArray(data) && data.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3"
            >
              <span className="text-sm text-slate-700">
                Bulletin #{b.id} — {b.mois}/{b.anne}
              </span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedId(b.id)}>
                Détail & impression
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={selectedId != null}
        onClose={() => setSelectedId(null)}
        title="Détail du bulletin"
        size="lg"
      >
        {selectedId != null && (
          <BulletinDetailPage bulletinId={selectedId} onPrint={printBulletin} />
        )}
      </Modal>
    </div>
  )
}

import { useState } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { getAllBulletins, recalculerToutesLesValeurs } from '../../services/bulletinPaieService.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import { formatMontant, formatCell } from '../../utils/format.js'

const COLUMNS = [
  { key: 'id', label: 'ID' },
  {
    key: 'numeroMatricule',
    label: 'Matricule',
    render: (v) => formatCell(v),
  },
  {
    key: 'salaireBrute',
    label: 'Salaire brut',
    render: (v) => formatMontant(v),
  },
  {
    key: 'baseIrsa',
    label: 'Base IRSA',
    render: (v) => formatMontant(v),
  },
  {
    key: 'irsa',
    label: 'IRSA',
    render: (v) => formatMontant(v),
  },
  {
    key: 'salaireNet',
    label: 'Salaire net',
    render: (v) => formatMontant(v),
  },
  {
    key: 'chargePatronal',
    label: 'Charges patronales',
    render: (v) => formatMontant(v),
  },
  {
    key: 'coutGlobale',
    label: 'Coût global',
    render: (v) => formatMontant(v),
  },
]

export default function RecalculPage() {
  const { data, error, loading, refetch } = useApi(() => getAllBulletins(), [])
  const [recalculating, setRecalculating] = useState(null)
  const [result, setResult] = useState(null)

  const handleRecalculer = async (id) => {
    setRecalculating(id)
    setResult(null)
    try {
      const updated = await recalculerToutesLesValeurs(id)
      setResult({ id, success: true, salaireBrut: updated.salaireBrute })
      refetch()
    } catch (err) {
      setResult({ id, success: false, message: err.message || String(err) })
    } finally {
      setRecalculating(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Recalcul des montants"
        description="Lance le recalcul complet (brut, IRSA, net, charges, coût global) d'un bulletin."
      />

      <div className="mt-4 overflow-hidden rounded-md border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Matricule
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Salaire brut
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Base IRSA
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                IRSA
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Salaire net
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Charges patronales
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500">
                Coût global
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.map((b) => (
              <tr key={b.id}>
                <td className="px-4 py-3 text-slate-800">{formatCell(b.id)}</td>
                <td className="px-4 py-3 text-slate-800">{formatCell(b.numeroMatricule)}</td>
                <td className="px-4 py-3 text-slate-800">{formatMontant(b.salaireBrute)}</td>
                <td className="px-4 py-3 text-slate-800">{formatMontant(b.baseIrsa)}</td>
                <td className="px-4 py-3 text-slate-800">{formatMontant(b.irsa)}</td>
                <td className="px-4 py-3 text-slate-800">{formatMontant(b.salaireNet)}</td>
                <td className="px-4 py-3 text-slate-800">{formatMontant(b.chargePatronal)}</td>
                <td className="px-4 py-3 text-slate-800">{formatMontant(b.coutGlobale)}</td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRecalculer(b.id)}
                    loading={recalculating === b.id}
                  >
                    Recalculer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result && (
        <p
          className={
            result.success
              ? 'mt-4 text-sm text-green-700'
              : 'mt-4 text-sm text-red-600'
          }
        >
          {result.success
            ? `Bulletin #${result.id} recalculé : brut = ${formatMontant(result.salaireBrut)}`
            : `Erreur pour bulletin #${result.id} : ${result.message}`}
        </p>
      )}

      <AsyncBoundary
        loading={loading}
        error={error}
        data={data}
        onRetry={refetch}
        emptyLabel="Aucun bulletin de paie."
      >
        {(rows) => <DataTable columns={COLUMNS} rows={rows} rowKey="id" />}
      </AsyncBoundary>
    </div>
  )
}

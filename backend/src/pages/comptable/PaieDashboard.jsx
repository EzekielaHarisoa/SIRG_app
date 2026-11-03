import { useState } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { getAllBulletins } from '../../services/bulletinPaieService.js'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Button from '../../components/ui/Button.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import { formatMontant, formatCell } from '../../utils/format.js'

export default function PaieDashboard() {
  const { data, error, loading, refetch } = useApi(() => getAllBulletins(), [])

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'numeroMatricule',
      label: 'Matricule',
      render: (v) => formatCell(v),
    },
    {
      key: 'dateEmission',
      label: 'Date émission',
      render: (v) => formatCell(v),
    },
    {
      key: 'salaireDeBase',
      label: 'Salaire de base',
      render: (v) => formatMontant(v),
    },
    {
      key: 'totalPrime',
      label: 'Total prime',
      render: (v) => formatMontant(v),
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
    {
      key: 'heurTravaille',
      label: 'Heures travaillées',
      render: (v) => formatMontant(v),
    },
    {
      key: 'congeRestant',
      label: 'Congés restants',
      render: (v) => formatMontant(v),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Espace paie"
        description="Tableau de bord des bulletins de paie. Les calculs sont faits côté backend."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Bulletins</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {loading ? '…' : data?.length ?? 0}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Salaire brut total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {loading ? '…' : (data || []).reduce((acc, b) => acc + (Number(b.salaireBrute) || 0), 0).toLocaleString('fr-FR')}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Coût global total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {loading ? '…' : (data || []).reduce((acc, b) => acc + (Number(b.coutGlobale) || 0), 0).toLocaleString('fr-FR')}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Bulletins récents</h2>
        <p className="text-sm text-slate-500">Chaque ligne correspond à un bulletin de paie.</p>
        <div className="mt-3">
          <AsyncBoundary
            loading={loading}
            error={error}
            data={data}
            onRetry={refetch}
            emptyLabel="Aucun bulletin de paie."
          >
            {(rows) => <DataTable columns={columns} rows={rows} rowKey="id" />}
          </AsyncBoundary>
        </div>
      </div>
    </div>
  )
}

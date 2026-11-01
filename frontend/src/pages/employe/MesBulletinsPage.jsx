import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import Button from '../../components/ui/Button.jsx'
import BulletinDetailPage from '../../components/paie/BulletinDetailPage.jsx'
import { useApi } from '../../hooks/useApi.js'
import { getBulletinsByEmploye } from '../../services/bulletinPaieService.js'
import { formatCell, formatMontant, monthLabel } from '../../utils/format.js'

/**
 * MesBulletinsPage — historique des bulletins de paie de l'employé.
 *
 * Le matricule n'est pas saisi par l'utilisateur : il est récupéré
 * automatiquement depuis l'identité de la session (useAuth).
 * C'est l'employé qui consulte ses propres bulletins.
 *
 * Les bulletins sont classés du plus récent au plus ancien
 * (commande déjà faite côté backend par ORDER BY date_emission DESC).
 */
export default function MesBulletinsPage() {
  const { user } = useAuth()
  const numeroMatricule = user?.numeroMatricule ?? null

  const [selectedId, setSelectedId] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)
  const [printMode, setPrintMode] = useState(false)

  // Si aucun matricule n'est disponible dans la session, on affiche un
  // message informatif et aucun champ de saisie n'est proposé.
  if (!numeroMatricule) {
    return (
      <div>
        <PageHeader
          title="Mes bulletins de paie"
          description="Aucune identité employé disponible. Connectez-vous avec un compte employé."
        />
        <div className="mt-8 flex items-center justify-center">
          <div className="max-w-sm text-center">
            <p className="text-sm text-slate-500">
              Votre identité n'est pas encore disponible dans la session.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Veuillez vous reconnecter avec votre compte employé.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { data, error, loading, refetch } = useApi(
    () => getBulletinsByEmploye(numeroMatricule),
    [numeroMatricule],
  )

  // Le bulletin sélectionné est extrait de la liste récupérée.
  const selectedBulletin =
    selectedId && data
      ? data.find((b) => b.id === selectedId) ?? null
      : null

  const handleView = (bulletin) => {
    setSelectedId(bulletin.id)
    setDetailLoading(true)
    setDetailError(null)
  }

  const handleCloseDetail = () => {
    setSelectedId(null)
    setDetailLoading(false)
    setDetailError(null)
  }

  const handlePrint = () => {
    if (!selectedBulletin) return
    setPrintMode(true)
  }

  const columns = [
    { key: 'id', label: 'N° bulletin' },
    { key: 'mois', label: 'Mois' },
    { key: 'anne', label: 'Année' },
    { key: 'dateEmission', label: 'Date émission' },
    { key: 'salaireBrute', label: 'Salaire brut', render: (v) => formatMontant(v) },
    { key: 'salaireNet', label: 'Salaire net', render: (v) => formatMontant(v) },
  ]

  return (
    <div>
      <PageHeader
        title="Mes bulletins de paie"
        description="Historique de tous les bulletins associés à votre matricule."
      />

      <div className="mb-4 rounded-md border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-700">
          <span className="font-medium">Matricule :</span>{' '}
          <span className="font-mono">{numeroMatricule}</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Liste des bulletins de paie récupérés depuis le module Paie du backend
          (API réelle, aucune donnée simulée).
        </p>
      </div>

      <AsyncBoundary
        loading={loading}
        error={error}
        data={data}
        onRetry={refetch}
        emptyLabel={
          data === null ? 'Chargement…' : 'Aucun bulletin de paie trouvé.'
        }
      >
        {(rows) => (
          <>
            {rows.length > 0 ? (
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                        >
                          {col.label}
                        </th>
                      ))}
                      <th
                        scope="col"
                        className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows
                      .slice()
                      .sort((a, b) => (b.dateEmission || 0) - (a.dateEmission || 0))
                      .map((bulletin) => (
                        <tr
                          key={bulletin.id}
                          className={`cursor-pointer transition-colors ${
                            selectedId === bulletin.id
                              ? 'bg-blue-50'
                              : 'hover:bg-slate-50'
                          }`}
                          onClick={() => handleView(bulletin)}
                        >
                          <td className="px-4 py-3 text-slate-800 font-medium">
                            #{bulletin.id}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {monthLabel(bulletin.mois)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatCell(bulletin.anne)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatCell(bulletin.dateEmission)}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {formatMontant(bulletin.salaireBrute)}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            <span
                              className={`inline-flex font-medium ${
                                Number(bulletin.salaireNet) > 0
                                  ? 'text-green-700'
                                  : 'text-slate-500'
                              }`}
                            >
                              {formatMontant(bulletin.salaireNet)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleView(bulletin)
                              }}
                            >
                              Consulter
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-slate-500">
                  {error
                    ? `Erreur : ${error.message}`
                    : 'Aucun bulletin de paie trouvé.'}
                </p>
              </div>
            )}
          </>
        )}
      </AsyncBoundary>

      {/* Détail d'un bulletin (page dédiée + impression A4) */}
  

      {/* Détail d'un bulletin (page dédiée + impression A4) */}
      {selectedBulletin && !printMode && (
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Détail du bulletin #{selectedBulletin.id}
          </h2>
          <BulletinDetailPage
            bulletinId={selectedBulletin.id}
            onPrint={handlePrint}
            onClose={handleCloseDetail}
          />
        </div>
      )}
    </div>
  )
}

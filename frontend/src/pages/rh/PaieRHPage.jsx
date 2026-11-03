import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import Button from '../../components/ui/Button.jsx'
import BulletinDetailPage from '../../components/paie/BulletinDetailPage.jsx'
import DocumentListe from '../../components/ui/DocumentListe.jsx'
import { useApi } from '../../hooks/useApi.js'
import { usePrintArea } from '../../hooks/usePrintArea.js'
import { getBulletinsByEmploye } from '../../services/bulletinPaieService.js'
import { getAllEmployes } from '../../services/employeService.js'
import { formatMontant, formatDate, isoDateLocale, monthLabel } from '../../utils/format.js'

export default function PaieRHPage() {
  const [matricule, setMatricule] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const { data: employes, error: employesError, loading: employesLoading } = useApi(
    () => getAllEmployes(),
    [],
  )

  const numeroMatricule = matricule ? Number(matricule) : null

  const { data, error, loading, refetch } = useApi(
    () =>
      numeroMatricule
        ? getBulletinsByEmploye(numeroMatricule)
        : Promise.resolve([]),
    [numeroMatricule],
  )

  // Classement du plus récent au plus ancien, partagé par le tableau écran
  // et par la version papier de la liste.
  const bulletins = Array.isArray(data)
    ? data
        .slice()
        .sort(
          (a, b) =>
            new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime(),
        )
    : []

  const employe = Array.isArray(employes)
    ? employes.find((e) => String(e.numerMatricule) === String(numeroMatricule)) ?? null
    : null

  const selectedBulletin =
    selectedId !== null && Array.isArray(data)
      ? data.find((b) => String(b.id) === String(selectedId)) ?? null
      : null

  // La liste est imprimable tant qu'aucune fiche n'est ouverte : la fiche
  // prend alors le relais pour l'impression.
  const zoneListe = usePrintArea(!selectedBulletin && bulletins.length > 0)

  const totalBrut = bulletins.reduce((somme, b) => somme + (Number(b.salaireBrute) || 0), 0)
  const totalNet = bulletins.reduce((somme, b) => somme + (Number(b.salaireNet) || 0), 0)

  const colonnesImpression = [
    { label: 'N° bulletin', valeur: (b) => `#${b.id}` },
    { label: 'Mois', valeur: (b) => monthLabel(b.mois) },
    { label: 'Année', valeur: (b) => b.anne ?? '—', align: 'right' },
    { label: 'Date émission', valeur: (b) => formatDate(b.dateEmission) },
    { label: 'Salaire brut', valeur: (b) => formatMontant(b.salaireBrute), align: 'right' },
    { label: 'Salaire net', valeur: (b) => formatMontant(b.salaireNet), align: 'right' },
  ]

  const handleView = (bulletin) => {
    setSelectedId(bulletin.id)
  }

  const handleCloseDetail = () => {
    setSelectedId(null)
  }

  const handlePrint = () => {
    window.print()
  }

  const columns = [
    { key: 'id', label: 'N° bulletin' },
    { key: 'mois', label: 'Mois' },
    { key: 'anne', label: 'Année' },
    { key: 'dateEmission', label: 'Date émission' },
    { key: 'salaireBrute', label: 'Salaire brut' },
    { key: 'salaireNet', label: 'Salaire net' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Espace RH – Paie"
        description="Consultez l'historique des bulletins de paie des employés et générez de nouveaux bulletins."
        actions={
          <Link
            to="/rh/paie/generer"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Générer un bulletin
          </Link>
        }
      />

      {/* Sélection de l'employé */}
      <div className="rounded-md border border-slate-200 bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Sélectionner un employé
        </label>

        <select
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          value={matricule}
          onChange={(e) => {
            setMatricule(e.target.value)
            setSelectedId(null)
          }}
          disabled={employesLoading}
        >
          <option value="">Choisir un employé...</option>

          {Array.isArray(employes) &&
            employes.map((employe) => (
              <option
                key={employe.numerMatricule}
                value={employe.numerMatricule}
              >
                {employe.nomEtPrenoms} — matricule {employe.numerMatricule}
              </option>
            ))}
        </select>

        {employesError && (
          <p className="mt-2 text-sm text-red-600">
            {employesError.message}
          </p>
        )}
      </div>

      {/* Historique des bulletins */}
      {numeroMatricule && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Historique des bulletins
              </h2>
              <p className="text-sm text-slate-500">
                Matricule : {numeroMatricule}
              </p>
            </div>

            {bulletins.length > 0 && (
              <Button variant="secondary" size="sm" onClick={() => window.print()}>
                Imprimer la liste
              </Button>
            )}
          </div>

          <AsyncBoundary
            loading={loading}
            error={error}
            data={data}
            onRetry={refetch}
            emptyLabel="Aucun bulletin de paie trouvé pour cet employé."
          >
            {() => (
              <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                        >
                          {column.label}
                        </th>
                      ))}

                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {bulletins
                      .map((bulletin) => (
                        <tr
                          key={bulletin.id}
                          className={`transition-colors ${
                            selectedId === bulletin.id
                              ? 'bg-blue-50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">
                            #{bulletin.id}
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            {monthLabel(bulletin.mois)}
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            {bulletin.anne ?? '—'}
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            {formatDate(bulletin.dateEmission)}
                          </td>

                          <td className="px-4 py-3 text-slate-800">
                            {formatMontant(bulletin.salaireBrute)}
                          </td>

                          <td className="px-4 py-3 font-medium text-green-700">
                            {formatMontant(bulletin.salaireNet)}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleView(bulletin)}
                            >
                              Consulter
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </AsyncBoundary>
        </section>
      )}

      {/* Version papier de la liste (rendue dans #print-area) */}
      <DocumentListe
        zone={zoneListe}
        titre="Historique des bulletins de paie"
        sousTitre={
          employe
            ? `${employe.nomEtPrenoms} — matricule ${numeroMatricule}`
            : `Matricule ${numeroMatricule}`
        }
        meta={[
          `${bulletins.length} bulletin${bulletins.length > 1 ? 's' : ''}`,
          `Édité le ${formatDate(isoDateLocale())}`,
          `Total brut ${formatMontant(totalBrut)}`,
          `Total net ${formatMontant(totalNet)}`,
        ]}
        colonnes={colonnesImpression}
        lignes={bulletins}
        piedDePage={`Total net à payer : ${formatMontant(totalNet)}`}
      />

      {/* Détail du bulletin sélectionné */}
      {selectedBulletin && (
        <section className="space-y-4" id="bulletin-detail">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              Détail du bulletin #{selectedBulletin.id}
            </h2>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCloseDetail}
            >
              Fermer
            </Button>
          </div>

          <BulletinDetailPage
            bulletinId={selectedBulletin.id}
            onPrint={handlePrint}
            onClose={handleCloseDetail}
          />
        </section>
      )}
    </div>
  )
}

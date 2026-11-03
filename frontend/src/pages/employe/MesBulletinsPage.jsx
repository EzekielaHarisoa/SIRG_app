import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import Button from '../../components/ui/Button.jsx'
import BulletinDetailPage from '../../components/paie/BulletinDetailPage.jsx'
import DocumentListe from '../../components/ui/DocumentListe.jsx'
import { useApi } from '../../hooks/useApi.js'
import { usePrintArea } from '../../hooks/usePrintArea.js'
import { getBulletinsByEmploye } from '../../services/bulletinPaieService.js'
import {
  formatCell,
  formatDate,
  formatMontant,
  isoDateLocale,
  monthLabel,
} from '../../utils/format.js'

/* Palette de la page de connexion, angles droits (comme les autres pages) */
const BTN_LINK = '!rounded-none !font-medium !text-[#005EB8] hover:!bg-slate-50'

const TXT = {
  titre: 'text-slate-900',
  corps: 'text-slate-700',
  secondaire: 'text-slate-600',
  discret: 'text-slate-500',
}

function Carte({ title, description, aside, children }) {
  return (
    <section className="border border-slate-200 bg-white">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <div className="min-w-0">
          <h2 className={`text-base font-semibold leading-6 tracking-tight ${TXT.titre}`}>{title}</h2>
          {description && (
            <p className={`mt-0.5 text-[13px] leading-5 ${TXT.secondaire}`}>{description}</p>
          )}
        </div>
        {aside}
      </header>
      {children}
    </section>
  )
}

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

  // Les hooks sont appelés avant tout retour anticipé (règle des hooks de React).
  const { data, error, loading, refetch } = useApi(
    () => (numeroMatricule ? getBulletinsByEmploye(numeroMatricule) : Promise.resolve([])),
    [numeroMatricule],
  )

  // Classement du plus récent au plus ancien, partagé par le tableau écran
  // et par la version papier de la liste.
  const bulletins = Array.isArray(data)
    ? data
        .slice()
        .sort((a, b) =>
          String(b.dateEmission ?? '').localeCompare(String(a.dateEmission ?? '')),
        )
    : []

  // La liste est imprimable tant qu'aucune fiche n'est ouverte : la fiche
  // prend alors le relais pour l'impression.
  const zoneListe = usePrintArea(!selectedId && bulletins.length > 0)

  const totalBrut = bulletins.reduce((somme, b) => somme + (Number(b.salaireBrute) || 0), 0)
  const totalNet = bulletins.reduce((somme, b) => somme + (Number(b.salaireNet) || 0), 0)

  const colonnesImpression = [
    { label: 'N° bulletin', valeur: (b) => `#${b.id}` },
    { label: 'Mois', valeur: (b) => monthLabel(b.mois) },
    { label: 'Année', valeur: (b) => (b.anne ?? '—'), align: 'right' },
    { label: 'Date d’émission', valeur: (b) => formatCell(b.dateEmission) },
    { label: 'Salaire brut', valeur: (b) => formatMontant(b.salaireBrute), align: 'right' },
    { label: 'Salaire net', valeur: (b) => formatMontant(b.salaireNet), align: 'right' },
  ]

  // Si aucun matricule n'est disponible dans la session, on affiche un
  // message informatif et aucun champ de saisie n'est proposé.
  if (!numeroMatricule) {
    return (
      <div className="space-y-5 antialiased">
        <PageHeader
          title="Mes bulletins de paie"
          description="Historique de tous les bulletins associés à votre matricule."
        />
        <div
          role="alert"
          className="border border-slate-300 bg-slate-50 p-3.5 text-sm leading-6 text-slate-800"
        >
          <p className="font-semibold">Identité employé indisponible</p>
          <p className="mt-0.5">
            Votre identité n’est pas encore disponible dans la session. Reconnectez-vous avec votre
            compte employé.
          </p>
        </div>
      </div>
    )
  }

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

  // Ouvre la boîte d'impression du navigateur (imprimer ou enregistrer en PDF).
  // Seul le bulletin est imprimé : le reste de la page est masqué avec print:hidden.
  const handlePrint = () => {
    if (!selectedBulletin) return
    window.print()
  }

  const nombre = Array.isArray(data) ? data.length : 0

  return (
    <div className="space-y-5 antialiased">
      <div className="print:hidden">
        <PageHeader
          title="Mes bulletins de paie"
          description="Historique de tous les bulletins associés à votre matricule."
        />
      </div>

      <section className="flex flex-col gap-1 print:hidden border border-slate-200 bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${TXT.secondaire}`}>
          Matricule{' '}
          <span className={`font-semibold tabular-nums ${TXT.titre}`}>{numeroMatricule}</span>
        </p>
        <p className={`text-[13px] tabular-nums ${TXT.secondaire}`}>
          <span className={`font-semibold ${TXT.titre}`}>{nombre}</span> bulletin
          {nombre > 1 ? 's' : ''}
        </p>
      </section>

      <div className="print:hidden">
      <Carte
        title="Historique"
        description="Du plus récent au plus ancien."
        aside={
          bulletins.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className={BTN_LINK}
              onClick={() => window.print()}
            >
              Imprimer la liste
            </Button>
          ) : null
        }
      >
        <AsyncBoundary
          loading={loading}
          error={error}
          data={data}
          onRetry={refetch}
          emptyLabel={data === null ? 'Chargement…' : 'Aucun bulletin de paie trouvé.'}
        >
          {() => (
            <>
              {bulletins.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
                        <th scope="col" className="px-4 py-2.5 font-semibold">N° bulletin</th>
                        <th scope="col" className="px-4 py-2.5 font-semibold">Mois</th>
                        <th scope="col" className="px-4 py-2.5 font-semibold">Année</th>
                        <th scope="col" className="px-4 py-2.5 font-semibold">Date d’émission</th>
                        <th scope="col" className="px-4 py-2.5 text-right font-semibold">Salaire brut</th>
                        <th scope="col" className="px-4 py-2.5 text-right font-semibold">Salaire net</th>
                        <th scope="col" className="px-4 py-2.5">
                          <span className="sr-only">Action</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {bulletins
                        .map((bulletin) => {
                          const actif = selectedId === bulletin.id
                          return (
                            <tr
                              key={bulletin.id}
                              aria-selected={actif}
                              className={`cursor-pointer transition-colors ${
                                actif ? 'bg-[#E3EEFC]' : 'hover:bg-slate-50'
                              }`}
                              onClick={() => handleView(bulletin)}
                            >
                              <td
                                className={`px-4 py-3 font-semibold tabular-nums ${
                                  actif ? 'text-[#00449E]' : TXT.titre
                                }`}
                              >
                                #{bulletin.id}
                              </td>
                              <td className={`px-4 py-3 ${TXT.corps}`}>{monthLabel(bulletin.mois)}</td>
                              <td className={`px-4 py-3 tabular-nums ${TXT.corps}`}>
                                {bulletin.anne ?? '—'}
                              </td>
                              <td className={`px-4 py-3 tabular-nums ${TXT.corps}`}>
                                {formatCell(bulletin.dateEmission)}
                              </td>
                              <td className={`px-4 py-3 text-right tabular-nums ${TXT.corps}`}>
                                {formatMontant(bulletin.salaireBrute)}
                              </td>
                              <td
                                className={`px-4 py-3 text-right font-semibold tabular-nums ${
                                  Number(bulletin.salaireNet) > 0 ? TXT.titre : TXT.discret
                                }`}
                              >
                                {formatMontant(bulletin.salaireNet)}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={BTN_LINK}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleView(bulletin)
                                  }}
                                >
                                  Consulter
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-12 text-center">
                  <p className={`text-sm ${TXT.secondaire}`}>
                    {error ? `Erreur : ${error.message}` : 'Aucun bulletin de paie trouvé.'}
                  </p>
                </div>
              )}
            </>
          )}
        </AsyncBoundary>
      </Carte>
      </div>

      {/* Version papier de la liste (rendue dans #print-area) */}
      <DocumentListe
        zone={zoneListe}
        titre="Bulletins de paie"
        sousTitre={user?.nomEtPrenoms || user?.login || `Matricule ${numeroMatricule}`}
        meta={[
          `Matricule ${numeroMatricule}`,
          `${bulletins.length} bulletin${bulletins.length > 1 ? 's' : ''}`,
          `Édité le ${formatDate(isoDateLocale())}`,
          `Total brut ${formatMontant(totalBrut)}`,
        ]}
        colonnes={colonnesImpression}
        lignes={bulletins}
        piedDePage={`Total net à payer : ${formatMontant(totalNet)}`}
      />

      {/* Détail d'un bulletin (page dédiée + impression A4) */}
      {selectedBulletin && (
        <div>
          <h2 className={`mb-3 print:hidden text-base font-semibold leading-6 tracking-tight ${TXT.titre}`}>
            Détail du bulletin <span className="tabular-nums">#{selectedBulletin.id}</span>
          </h2>
          <BulletinDetailPage
            bulletinId={selectedBulletin.id}
            employeNom={user?.nomEtPrenoms || user?.login}
            onPrint={handlePrint}
            onClose={handleCloseDetail}
          />
        </div>
      )}
    </div>
  )
}
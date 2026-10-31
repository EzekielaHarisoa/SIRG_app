import { useCallback, useMemo, useRef, useState } from 'react'

import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/ui/PageHeader.jsx'
import AsyncBoundary from '../../components/ui/AsyncBoundary.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import QrScanner from '../../components/pointages/QrScanner.jsx'

import { useApi } from '../../hooks/useApi.js'
import { ApiError } from '../../services/api.js'
import {
  getEvenementsByDate,
  getPointagesByMatricule,
  verifierQrCode,
  enregistrerEvenement,
} from '../../services/pointageService.js'
import {
  EVENEMENTS_POINTAGE,
  evenementsAutorises,
  labelEvenement,
} from '../../config/contracts.js'
import {
  formatDate,
  formatHeure,
  formatCell,
  isoDateLocale,
} from '../../utils/format.js'

const FORMATEUR_MINUTES = (valeur) =>
  valeur === null || valeur === undefined ? '—' : `${formatCell(valeur)} min`
const FORMATEUR_HEURES = (valeur) =>
  valeur === null || valeur === undefined ? '—' : `${formatCell(valeur)} h`

function messageErreurPointage(error) {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return {
        texte:
          'Serveur injoignable. Vérifiez que le backend Spring Boot est démarré sur le port 8080.',
      }
    }
    if (error.status === 401) {
      return { texte: 'Votre session a expiré. Déconnectez-vous, puis reconnectez-vous.' }
    }
    if (error.status === 400 || error.status === 409) {
      return {
        texte: 'L’événement n’a pas pu être enregistré.',
        // The backend explains the rule that was broken (order of events…).
        detail: error.message,
      }
    }
    if (error.status === 404) {
      return { texte: 'Aucun pointage n’existe pour cette journée.' }
    }
    if (error.status >= 500) {
      return {
        texte: 'Le serveur a rencontré une erreur pendant l’enregistrement. Réessayez dans un instant.',
      }
    }
  }

  return { texte: error?.message || 'Une erreur est survenue.' }
}

const COLONNES_HISTORIQUE = [
  { key: 'datePointage', label: 'Date', render: (valeur) => formatDate(valeur) },
  { key: 'heureEntree', label: 'Entrée', render: (valeur) => formatHeure(valeur) },
  { key: 'heureSortie', label: 'Sortie', render: (valeur) => formatHeure(valeur) },
  { key: 'retardMinute', label: 'Retard', render: FORMATEUR_MINUTES },
  { key: 'heureSup', label: 'Heures sup.', render: FORMATEUR_HEURES },
]

export default function MesPointagesPage() {
  const { user } = useAuth()
  // Identity comes from the authenticated session — never from user input.
  const matricule = user?.numeroMatricule ?? null

  const [scannerOuvert, setScannerOuvert] = useState(false)
  const [saisieManuelle, setSaisieManuelle] = useState(false)
  const [codeManuel, setCodeManuel] = useState('')

  // repos → verification → choix
  const [etape, setEtape] = useState('repos')
  const [token, setToken] = useState('')
  const [typeChoisi, setTypeChoisi] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const envoiRef = useRef(false)

  const [message, setMessage] = useState(null)

  const aujourdHui = isoDateLocale()

  const {
    data: evenements,
    error: erreurEvenements,
    loading: chargementEvenements,
    refetch: refetchEvenements,
  } = useApi(
    () => (matricule ? getEvenementsByDate(matricule, aujourdHui) : Promise.resolve([])),
    [matricule, aujourdHui],
  )

  const {
    data: historique,
    error: erreurHistorique,
    loading: chargementHistorique,
    refetch: refetchHistorique,
  } = useApi(
    () => (matricule ? getPointagesByMatricule(matricule) : Promise.resolve([])),
    [matricule],
  )

  const listeEvenements = Array.isArray(evenements) ? evenements : []
  const dernierEvenement = listeEvenements[listeEvenements.length - 1] || null

  // /pointage/filtreMatricule does not guarantee an order: sort for display.
  const listeHistorique = useMemo(() => {
    const lignes = Array.isArray(historique) ? [...historique] : []
    return lignes.sort((a, b) =>
      String(b?.datePointage ?? '').localeCompare(String(a?.datePointage ?? '')),
    )
  }, [historique])

  const pointageDuJour = useMemo(
    () => listeHistorique.find((pointage) => pointage?.datePointage === aujourdHui) || null,
    [listeHistorique, aujourdHui],
  )

  // While the day is still loading we do not block anything: the backend keeps
  // the final say and returns an explicit message.
  const autorises =
    chargementEvenements || erreurEvenements
      ? null
      : evenementsAutorises(dernierEvenement?.typeEvenement)

  const estAutorise = (type) => !autorises || autorises.includes(type)
  const journeeClose = Array.isArray(autorises) && autorises.length === 0

  const fermerScanner = useCallback(() => {
    setScannerOuvert(false)
    setSaisieManuelle(false)
    setCodeManuel('')
  }, [])

  const traiterToken = useCallback(async (tokenBrut) => {
    const valeur = String(tokenBrut || '').trim()
    if (!valeur) return

    setScannerOuvert(false)
    setSaisieManuelle(false)
    setCodeManuel('')
    setMessage(null)
    setToken(valeur)
    setTypeChoisi('')
    setEtape('verification')

    try {
      const valide = await verifierQrCode(valeur)

      if (valide !== true) {
        setEtape('repos')
        setToken('')
        setMessage({
          type: 'error',
          texte:
            'Ce QR code n’est plus valide : il a probablement expiré (5 minutes). Scannez le QR code affiché actuellement.',
        })
        return
      }

      setEtape('choix')
    } catch (err) {
      setEtape('repos')
      setToken('')
      setMessage({ type: 'error', ...messageErreurPointage(err) })
    }
  }, [])

  const annulerChoix = () => {
    setEtape('repos')
    setToken('')
    setTypeChoisi('')
    setMessage(null)
  }

  const handleConfirmer = async () => {
    if (envoiRef.current) return

    if (!matricule) {
      setMessage({
        type: 'error',
        texte: 'Votre compte ne contient pas de numéro de matricule : le pointage est impossible.',
      })
      return
    }

    if (etape !== 'choix' || !token) {
      setMessage({ type: 'error', texte: 'Scannez d’abord le QR code affiché à l’entrée.' })
      return
    }

    if (!typeChoisi) {
      setMessage({ type: 'error', texte: 'Sélectionnez l’événement à enregistrer.' })
      return
    }

    envoiRef.current = true
    setEnvoi(true)
    setMessage(null)

    try {
      await enregistrerEvenement(matricule, typeChoisi)

      setMessage({
        type: 'success',
        texte: `Pointage enregistré : ${labelEvenement(typeChoisi)} à ${new Date().toLocaleTimeString(
          'fr-FR',
          { hour: '2-digit', minute: '2-digit' },
        )}.`,
      })

      setEtape('repos')
      setToken('')
      setTypeChoisi('')

      await Promise.all([refetchEvenements(), refetchHistorique()])
    } catch (err) {
      setMessage({ type: 'error', ...messageErreurPointage(err) })
    } finally {
      envoiRef.current = false
      setEnvoi(false)
    }
  }

  const ouvrirScanner = () => {
    setMessage(null)
    setSaisieManuelle(false)
    setCodeManuel('')
    setScannerOuvert(true)
  }

  const handleSaisieManuelle = (evenement) => {
    evenement.preventDefault()
    traiterToken(codeManuel)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes pointages"
        description="Enregistrez vos événements de présence avec le QR code affiché à l’entrée."
      />

      {/* Identité issue de la session */}
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {user?.nomEtPrenoms || user?.login || 'Utilisateur'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {matricule ? `Matricule ${matricule}` : 'Matricule indisponible'} ·{' '}
            {formatDate(aujourdHui)}
          </p>
        </div>
        <div className="text-xs text-slate-500">
          {dernierEvenement ? (
            <span>
              Dernier événement :{' '}
              <span className="font-medium text-slate-700">
                {labelEvenement(dernierEvenement.typeEvenement)}
              </span>{' '}
              à {formatHeure(dernierEvenement.dateHeure)}
            </span>
          ) : (
            <span>Aucun événement aujourd’hui</span>
          )}
        </div>
      </section>

      {!matricule && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Votre profil ne contient pas de numéro de matricule : le pointage et l’historique sont
          indisponibles. Contactez le service RH pour rattacher votre compte à un employé.
        </div>
      )}

      {message && (
        <div
          role="status"
          className={`rounded-md border p-3 text-sm ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          <p>{message.texte}</p>
          {message.detail && <p className="mt-1 text-xs opacity-80">{message.detail}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Pointage */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-3">
          <h2 className="text-sm font-semibold text-slate-900">Pointer maintenant</h2>

          {etape === 'repos' && (
            <>
              <p className="mt-1 text-sm text-slate-500">
                Scannez le QR code affiché à l’entrée, puis choisissez l’événement à enregistrer.
              </p>
              {journeeClose && (
                <p className="mt-2 text-sm text-slate-600">
                  Votre journée est clôturée : la sortie a déjà été enregistrée.
                </p>
              )}
              <div className="mt-4">
                <Button
                  variant="primary"
                  onClick={ouvrirScanner}
                  disabled={!matricule || envoi || journeeClose}
                  className="w-full sm:w-auto"
                >
                  Scanner le QR code
                </Button>
              </div>
            </>
          )}

          {etape === 'verification' && (
            <div className="mt-4 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <span
                aria-hidden="true"
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-r-slate-600"
              />
              Vérification du QR code…
            </div>
          )}

          {etape === 'choix' && (
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                <span aria-hidden="true">✓</span>
                <p>QR code vérifié. Choisissez l’événement à enregistrer.</p>
              </div>

              <fieldset>
                <legend className="sr-only">Événement à enregistrer</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {EVENEMENTS_POINTAGE.map((evenement) => {
                    const desactive = !estAutorise(evenement.value)
                    const selectionne = typeChoisi === evenement.value

                    return (
                      <button
                        key={evenement.value}
                        type="button"
                        aria-pressed={selectionne}
                        disabled={desactive || envoi}
                        title={
                          desactive
                            ? 'Non disponible après l’événement déjà enregistré.'
                            : undefined
                        }
                        onClick={() => setTypeChoisi(evenement.value)}
                        className={[
                          'rounded-md border p-3 text-left transition-colors',
                          'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
                          selectionne
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                          desactive || envoi
                            ? 'cursor-not-allowed opacity-50 hover:border-slate-200 hover:bg-white'
                            : '',
                        ].join(' ')}
                      >
                        <span className="block text-sm font-medium text-slate-900">
                          {evenement.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {evenement.description}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="primary"
                  onClick={handleConfirmer}
                  loading={envoi}
                  disabled={!typeChoisi || envoi}
                >
                  {envoi ? 'Enregistrement…' : 'Confirmer le pointage'}
                </Button>
                <Button variant="secondary" onClick={annulerChoix} disabled={envoi}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Journée en cours */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Journée en cours</h2>

          <div className="mt-4">
            {chargementEvenements ? (
              <p className="text-sm text-slate-500">Chargement…</p>
            ) : erreurEvenements ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {messageErreurPointage(erreurEvenements).texte}
              </div>
            ) : listeEvenements.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun événement enregistré aujourd’hui.</p>
            ) : (
              <ol className="divide-y divide-slate-100">
                {listeEvenements.map((evenement) => (
                  <li
                    key={evenement.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-14 text-sm font-medium tabular-nums text-slate-700">
                        {formatHeure(evenement.dateHeure)}
                      </span>
                      <span className="text-sm text-slate-600">
                        {labelEvenement(evenement.typeEvenement)}
                      </span>
                    </div>
                    {evenement.modePointage && (
                      <span className="text-[11px] uppercase tracking-wide text-slate-400">
                        {evenement.modePointage}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {pointageDuJour && (
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <div>
                <dt className="text-xs text-slate-500">Entrée</dt>
                <dd className="text-sm font-medium tabular-nums text-slate-800">
                  {formatHeure(pointageDuJour.heureEntree)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Sortie</dt>
                <dd className="text-sm font-medium tabular-nums text-slate-800">
                  {formatHeure(pointageDuJour.heureSortie)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Retard</dt>
                <dd className="text-sm font-medium tabular-nums text-slate-800">
                  {FORMATEUR_MINUTES(pointageDuJour.retardMinute)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Heures sup.</dt>
                <dd className="text-sm font-medium tabular-nums text-slate-800">
                  {FORMATEUR_HEURES(pointageDuJour.heureSup)}
                </dd>
              </div>
            </dl>
          )}
        </section>
      </div>

      {/* Historique */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Historique</h2>
          <p className="mt-1 text-sm text-slate-500">
            Récapitulatif de vos journées de présence, calculé par le backend.
          </p>
        </div>

        {!matricule ? (
          <EmptyState
            label="Historique indisponible"
            hint="Votre compte n’est rattaché à aucun matricule employé."
          />
        ) : (
          <AsyncBoundary
            loading={chargementHistorique}
            error={erreurHistorique}
            data={listeHistorique}
            onRetry={refetchHistorique}
            emptyLabel="Aucun pointage enregistré pour le moment."
          >
            {(rows) => (
              <DataTable columns={COLONNES_HISTORIQUE} rows={rows} rowKey="id" />
            )}
          </AsyncBoundary>
        )}
      </section>

      <Modal
        open={scannerOuvert}
        onClose={fermerScanner}
        title="Scanner le QR code"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Autorisez la caméra si le navigateur le demande, puis présentez le QR code affiché à
            l’entrée.
          </p>

          <QrScanner onScan={traiterToken} />

          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setSaisieManuelle((valeur) => !valeur)}
              className="text-xs font-medium text-blue-700 hover:underline"
            >
              {saisieManuelle ? 'Masquer la saisie manuelle' : 'Saisir le code manuellement'}
            </button>

            {saisieManuelle && (
              <form onSubmit={handleSaisieManuelle} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <div className="flex-1">
                  <label htmlFor="code-manuel" className="sr-only">
                    Code du QR
                  </label>
                  <input
                    id="code-manuel"
                    type="text"
                    value={codeManuel}
                    onChange={(evenement) => setCodeManuel(evenement.target.value)}
                    placeholder="Code affiché sur le QR code"
                    autoComplete="off"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={!codeManuel.trim()}>
                  Valider
                </Button>
              </form>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" onClick={fermerScanner}>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

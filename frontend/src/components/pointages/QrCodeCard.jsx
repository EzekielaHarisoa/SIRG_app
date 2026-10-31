import { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../ui/Button.jsx'
import { genererQrCode } from '../../services/pointageService.js'
import { ApiError } from '../../services/api.js'
import { formatCell } from '../../utils/format.js'

// The endpoint generates (and revokes the previous) token on every call, so
// concurrent calls must never be issued: React StrictMode mounts effects twice
// in development, and two calls would display an already-revoked QR code.
let requeteEnCours = null

function demanderQr({ force = false } = {}) {
  if (force) requeteEnCours = null

  if (!requeteEnCours) {
    requeteEnCours = genererQrCode().finally(() => {
      requeteEnCours = null
    })
  }

  return requeteEnCours
}

function dateHeure(valeur) {
  const texte = formatCell(valeur)
  const [jour, heure] = texte.split(' ')
  if (!heure) return texte
  const [annee, mois, jourDuMois] = jour.split('-')
  return `${jourDuMois}/${mois}/${annee} à ${heure}`
}

// The countdown follows the expiry timestamp issued by the backend: starting
// from "now + 5 min" would keep showing a valid code after the server already
// refused it (the response always arrives a little after the creation).
function echeanceLocale(data) {
  const expiration = Date.parse(data?.dateExpiration)
  if (Number.isFinite(expiration)) return expiration

  const creation = Date.parse(data?.dateCreation)
  if (Number.isFinite(creation)) return creation + 5 * 60 * 1000

  return Date.now() + 5 * 60 * 1000
}

function messageErreur(error) {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Serveur injoignable. Vérifiez que le backend Spring Boot est démarré sur le port 8080.'
    }
    if (error.status >= 500) {
      return 'Le serveur n’a pas pu générer le QR code. Réessayez dans un instant.'
    }
    return error.message
  }
  return error?.message || 'Le QR code n’a pas pu être généré.'
}

/**
 * QrCodeCard — displays the shared entrance QR code for the RH desk.
 *
 * The countdown is computed from the validity duration announced by the
 * backend, applied to the local clock: a small clock difference with the
 * server cannot make the QR look valid or expired too early.
 */
export default function QrCodeCard() {
  const [qr, setQr] = useState(null)
  const [echeance, setEcheance] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [maintenant, setMaintenant] = useState(() => Date.now())

  // Browsers throttle timers in background tabs: refresh immediately when the
  // entrance screen becomes visible again so the countdown is never stale.
  useEffect(() => {
    const rafraichir = () => setMaintenant(Date.now())
    const minuteur = setInterval(rafraichir, 1000)

    document.addEventListener('visibilitychange', rafraichir)
    window.addEventListener('focus', rafraichir)

    return () => {
      clearInterval(minuteur)
      document.removeEventListener('visibilitychange', rafraichir)
      window.removeEventListener('focus', rafraichir)
    }
  }, [])

  const charger = useCallback(async () => {
    setChargement(true)
    setErreur(null)

    try {
      const data = await demanderQr({ force: true })
      setQr(data)
      setEcheance(echeanceLocale(data))
    } catch (err) {
      setQr(null)
      setEcheance(null)
      setErreur(err)
    } finally {
      setChargement(false)
    }
  }, [])

  const chargerRef = useRef(charger)
  useEffect(() => {
    chargerRef.current = charger
  }, [charger])

  // Initial load: state is only updated once the response arrives.
  useEffect(() => {
    let ignore = false

    demanderQr()
      .then((data) => {
        if (ignore) return
        setQr(data)
        setEcheance(echeanceLocale(data))
        setErreur(null)
      })
      .catch((err) => {
        if (ignore) return
        setQr(null)
        setEcheance(null)
        setErreur(err)
      })
      .finally(() => {
        if (!ignore) setChargement(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  // Exactly one renewal per expiry: the timer is rebuilt for each new QR code,
  // so the code on screen is never revoked while it is still valid.
  useEffect(() => {
    if (!echeance) return

    const delai = Math.max(0, echeance - Date.now()) + 500
    const minuteur = setTimeout(() => chargerRef.current(), delai)
    return () => clearTimeout(minuteur)
  }, [echeance])

  const restantSecondes = echeance ? Math.max(0, Math.ceil((echeance - maintenant) / 1000)) : 0
  const expire = Boolean(echeance) && restantSecondes === 0
  const compteARebours = `${String(Math.floor(restantSecondes / 60)).padStart(2, '0')}:${String(
    restantSecondes % 60,
  ).padStart(2, '0')}`

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">QR code de pointage</h2>
          <p className="mt-1 text-sm text-slate-500">
            À afficher à l’entrée : les employés le scannent puis choisissent leur événement.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={charger}
          loading={chargement}
          disabled={chargement}
        >
          Renouveler
        </Button>
      </div>

      {erreur && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p>{messageErreur(erreur)}</p>
          <div className="mt-3">
            <Button variant="secondary" size="sm" onClick={charger}>
              Réessayer
            </Button>
          </div>
        </div>
      )}

      {!erreur && (
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-48 w-48 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-2">
            {qr?.imageBase64 ? (
              <img
                src={`data:image/png;base64,${qr.imageBase64}`}
                alt="QR code à scanner pour enregistrer un pointage"
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-sm text-slate-400">
                {chargement ? 'Génération…' : 'Aucun code'}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <dl className="space-y-2 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-slate-500">Créé le</dt>
                <dd className="text-right text-slate-800">{dateHeure(qr?.dateCreation)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-slate-500">Expire le</dt>
                <dd className="text-right text-slate-800">{dateHeure(qr?.dateExpiration)}</dd>
              </div>
            </dl>

            <div className="mt-3 flex items-center gap-2">
              <span
                aria-live="polite"
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                  expire
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : restantSecondes <= 60
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-green-200 bg-green-50 text-green-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${
                    expire
                      ? 'bg-red-500'
                      : restantSecondes <= 60
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                  }`}
                />
                {chargement
                  ? 'Renouvellement…'
                  : expire
                    ? 'Expiré — renouvellement en cours'
                    : `Valide ${compteARebours}`}
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Le renouvellement révoque le code précédent. Affichez un seul écran à l’entrée.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

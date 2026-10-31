import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import Button from '../ui/Button.jsx'

// Some browsers keep getUserMedia pending forever (permission prompt ignored,
// silent driver). Without this limit the panel would stay on "Démarrage…".
const DELAI_DEMARRAGE_MS = 10000

// getUserMedia / ZXing errors translated into actionable French messages.
function messageCamera(error) {
  const nom = error?.name || ''

  if (nom === 'NotAllowedError' || nom === 'SecurityError' || nom === 'PermissionDeniedError') {
    return "L’accès à la caméra a été refusé. Autorisez la caméra pour ce site dans les réglages du navigateur, puis réessayez."
  }
  if (nom === 'NotFoundError' || nom === 'DevicesNotFoundError' || nom === 'OverconstrainedError') {
    return "Aucune caméra n’a été détectée sur cet appareil. Utilisez la saisie manuelle du code ci-dessous."
  }
  if (nom === 'NotReadableError' || nom === 'TrackStartError') {
    return 'La caméra est déjà utilisée par une autre application. Fermez-la, puis réessayez.'
  }
  if (nom === 'AbortError') {
    return 'Le démarrage de la caméra a été interrompu. Réessayez.'
  }
  return 'La caméra n’a pas pu démarrer. Vérifiez les autorisations, puis réessayez.'
}

/**
 * QrScanner — reads one QR code, then stops the camera.
 *
 * The parent must unmount this component once a code is read: the camera is
 * always released on unmount, so closing the panel can never leave it running.
 *
 * @param {(texte: string) => void} onScan - called once per successful read
 */
export default function QrScanner({ onScan }) {
  const videoRef = useRef(null)
  const controlesRef = useRef(null)
  const dejaLuRef = useRef(false)
  const onScanRef = useRef(onScan)

  const [statut, setStatut] = useState('demarrage') // demarrage | actif | erreur

  // Kept in a ref so a new parent callback never restarts the camera.
  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])
  const [erreur, setErreur] = useState('')
  const [tentative, setTentative] = useState(0)

  useEffect(() => {
    let annule = false
    let abandonne = false
    let delai = null
    const video = videoRef.current
    const lecteur = new BrowserQRCodeReader()
    dejaLuRef.current = false

    async function demarrer() {
      setStatut('demarrage')
      setErreur('')

      delai = setTimeout(() => {
        if (annule || dejaLuRef.current) return
        abandonne = true
        setStatut('erreur')
        setErreur(
          'La caméra ne démarre pas. Autorisez son accès dans le navigateur, puis réessayez — ou utilisez la saisie manuelle du code.',
        )
        controlesRef.current?.stop()
        controlesRef.current = null
      }, DELAI_DEMARRAGE_MS)

      try {
        const controles = await lecteur.decodeFromConstraints(
          // `ideal` lets a phone pick the rear camera without failing on desktop.
          { video: { facingMode: { ideal: 'environment' } } },
          video,
          (resultat) => {
            if (annule || dejaLuRef.current) return

            const texte = resultat?.getText?.()?.trim()
            if (!texte) return

            dejaLuRef.current = true
            controlesRef.current?.stop()
            controlesRef.current = null
            onScanRef.current?.(texte)
          },
        )

        clearTimeout(delai)

        if (annule || abandonne || dejaLuRef.current) {
          controles.stop()
          return
        }

        controlesRef.current = controles
        setStatut('actif')
      } catch (err) {
        clearTimeout(delai)
        if (annule || abandonne) return
        setStatut('erreur')
        setErreur(messageCamera(err))
      }
    }

    demarrer()

    return () => {
      annule = true
      clearTimeout(delai)
      controlesRef.current?.stop()
      controlesRef.current = null

      const flux = video?.srcObject
      if (flux && typeof flux.getTracks === 'function') {
        flux.getTracks().forEach((piste) => piste.stop())
      }
    }
  }, [tentative])

  const relancer = () => {
    setErreur('')
    setTentative((valeur) => valeur + 1)
  }

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
        <video
          ref={videoRef}
          className="aspect-square w-full object-cover"
          muted
          playsInline
          autoPlay
        />

        {statut === 'demarrage' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-slate-200">
            <span
              aria-hidden="true"
              className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-500 border-r-slate-100"
            />
            <p className="text-sm">Démarrage de la caméra…</p>
          </div>
        )}

        {statut === 'actif' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-40 w-40 rounded-lg border-2 border-white/70 shadow-[0_0_0_9999px_rgba(2,6,23,0.35)]" />
          </div>
        )}
      </div>

      <div aria-live="polite">
        {statut === 'actif' && (
          <p className="text-sm text-slate-600">
            Présentez le QR code affiché à l’entrée dans le cadre.
          </p>
        )}

        {statut === 'erreur' && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{erreur}</p>
            <div className="mt-3">
              <Button variant="secondary" size="sm" onClick={relancer}>
                Réessayer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

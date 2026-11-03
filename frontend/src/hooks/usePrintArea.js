import { useEffect, useState } from 'react'

/**
 * Compteur d'impressions actives : la classe posée sur <body> ne doit être
 * retirée que lorsque plus aucun document n'est affiché.
 */
let documentsActifs = 0

function poserClasseImpression() {
  documentsActifs += 1
  document.body.classList.add('printing-document')
}

function retirerClasseImpression() {
  documentsActifs = Math.max(0, documentsActifs - 1)
  if (documentsActifs === 0) {
    document.body.classList.remove('printing-document')
  }
}

/** Crée (une seule fois) le conteneur d'impression, hors de l'application. */
function creerZoneImpression() {
  if (typeof document === 'undefined' || !document.body) return null

  let conteneur = document.getElementById('print-area')
  if (!conteneur) {
    conteneur = document.createElement('div')
    conteneur.id = 'print-area'
    document.body.appendChild(conteneur)
  }
  return conteneur
}

/**
 * Zone d'impression : un conteneur unique (#print-area) ajouté au <body>,
 * hors de l'application. Tant qu'un document y est affiché,
 * `body.printing-document` masque l'interface (#root) à l'impression et
 * n'imprime que cette zone (voir index.css).
 *
 * @param {boolean} actif - true tant que le document doit être imprimable
 * @returns {HTMLElement|null} la zone où porter le document (portail React)
 */
export function usePrintArea(actif) {
  const [zone] = useState(creerZoneImpression)

  useEffect(() => {
    if (!actif) return undefined

    poserClasseImpression()

    return () => {
      retirerClasseImpression()
    }
  }, [actif])

  return actif ? zone : null
}

export default usePrintArea

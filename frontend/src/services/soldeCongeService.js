import api from './api.js'

// Contrats confirmés contre com.project.backend.conge.TrancheConge.TrancheCongeController.
// Le solde n'est plus stocké dans une table dédiée : il est calculé à partir
// des tranches (2 x 15 jours) et des consommations enregistrées à l'acceptation.
//   GET  /tranches-conge/solde/{numeroMatricule}      -> SoldeCongeDTO (agrégat + tranches)
//   GET  /tranches-conge/employe/{numeroMatricule}    -> TrancheCongeSoldeDTO[]
//   POST /tranches-conge/initialiser/{numeroMatricule} -> 204

export function getSoldeGlobal(numeroMatricule) {
  return api.get(`/tranches-conge/solde/${encodeURIComponent(numeroMatricule)}`)
}

export function getTranches(numeroMatricule) {
  return api.get(`/tranches-conge/employe/${encodeURIComponent(numeroMatricule)}`)
}

/**
 * Crée les deux tranches du cycle courant si elles n'existent pas encore.
 * Le backend refuse (409) tant que le premier anniversaire d'embauche n'est
 * pas atteint.
 */
export function initialiserTranches(numeroMatricule) {
  return api.post(`/tranches-conge/initialiser/${encodeURIComponent(numeroMatricule)}`)
}

export default {
  getSoldeGlobal,
  getTranches,
  initialiserTranches,
}

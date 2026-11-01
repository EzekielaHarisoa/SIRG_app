import api from './api.js'

// Contrats confirmés contre com.project.backend.conge.DemandeCongeController.
//   GET   /demandeConge
//   GET   /demandeConge/byId/{id}
//   GET   /demandeConge/employe/{numeroMatricule}
//   POST  /demandeConge                                 -> 201
//   PATCH /demandeConge/{id}/acceptation                -> 204
//   PATCH /demandeConge/{id}/refus  { motifRefus }      -> 204

export function getAllDemandes() {
  return api.get('/demandeConge')
}

export function createDemande(payload) {
  return api.post('/demandeConge', payload)
}

export function getDemandesByEmploye(numeroMatricule) {
  return api.get(`/demandeConge/employe/${encodeURIComponent(numeroMatricule)}`)
}

export function getDemandeById(id) {
  return api.get(`/demandeConge/byId/${encodeURIComponent(id)}`)
}

/**
 * Accepte une demande en attente.
 * Le backend enregistre les périodes (ABSENCE / CONGE_PAYE) et consomme les
 * tranches dans une seule transaction.
 */
export function accepterDemande(id) {
  return api.patch(`/demandeConge/${encodeURIComponent(id)}/acceptation`)
}

/** Refuse une demande en attente. Le motif est obligatoire côté backend. */
export function refuserDemande(id, motifRefus) {
  return api.patch(`/demandeConge/${encodeURIComponent(id)}/refus`, { motifRefus })
}

export default {
  getAllDemandes,
  createDemande,
  getDemandesByEmploye,
  getDemandeById,
  accepterDemande,
  refuserDemande,
}

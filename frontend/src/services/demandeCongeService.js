import api from './api.js'

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

export default {
  getAllDemandes,
  createDemande,
  getDemandesByEmploye,
  getDemandeById,
}

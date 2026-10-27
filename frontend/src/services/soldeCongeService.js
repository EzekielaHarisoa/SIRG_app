import api from './api.js'

export function getSoldeByMatricule(numeroMatricule) {
  return api.get(`/soldeConge/${encodeURIComponent(numeroMatricule)}`)
}

export function getSoldeByMatriculeAndYear(numeroMatricule, anne) {
  return api.get(`/soldeConge/${encodeURIComponent(numeroMatricule)}/${encodeURIComponent(anne)}`)
}

export function createSolde(payload) {
  return api.post('/soldeConge', payload)
}

export function updateSolde(payload) {
  return api.put('/soldeConge', payload)
}

export default {
  getSoldeByMatricule,
  getSoldeByMatriculeAndYear,
  createSolde,
  updateSolde,
}

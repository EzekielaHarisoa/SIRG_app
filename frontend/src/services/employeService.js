import api from './api.js'

export function getAllEmployes() {
  return api.get('/employe')
}

export function createEmploye(payload) {
  return api.post('/employe', payload)
}

export function updateEmploye(numeroMatricule, payload) {
  return api.put(`/employe/${encodeURIComponent(numeroMatricule)}`, payload)
}

export default { getAllEmployes, createEmploye, updateEmploye }

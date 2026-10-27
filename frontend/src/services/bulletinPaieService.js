import api from './api.js'

export function getAllBulletins() {
  return api.get('/api/bulletins')
}

export function getBulletinById(id) {
  return api.get(`/api/bulletins/${encodeURIComponent(id)}`)
}

export function getBulletinsByEmploye(numeroMatricule) {
  return api.get(`/api/bulletins/employe/${encodeURIComponent(numeroMatricule)}`)
}

export function getTotalPrimes(id) {
  return api.get(`/api/bulletins/${encodeURIComponent(id)}/totalPrimes`)
}

export function updateTotalPrimes(id, totalPrimes) {
  return api.put(`/api/bulletins/${encodeURIComponent(id)}/totalPrimes`, totalPrimes)
}

export function getSalaireBrut(id) {
  return api.get(`/api/bulletins/${encodeURIComponent(id)}/salaireBrut`)
}

export function updateSalaireBrut(id, salaireBrut) {
  return api.put(`/api/bulletins/${encodeURIComponent(id)}/salaireBrut`, salaireBrut)
}

export function createBulletin(payload) {
  return api.post('/api/bulletins', payload)
}

export default {
  getAllBulletins,
  getBulletinById,
  getBulletinsByEmploye,
  getTotalPrimes,
  updateTotalPrimes,
  getSalaireBrut,
  updateSalaireBrut,
  createBulletin,
}

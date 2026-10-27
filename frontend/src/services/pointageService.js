import api from './api.js'

export function getAllPointages() {
  return api.get('/pointage')
}

export function createPointage(payload) {
  return api.post('/pointage', payload)
}

export function getPointagesByMatricule(numeroMatricule) {
  return api.get(`/pointage/filtreMatricule/${encodeURIComponent(numeroMatricule)}`)
}

export function getPointagesByDate(date) {
  return api.get(`/pointage/filtreDate/${encodeURIComponent(date)}`)
}

export default {
  getAllPointages,
  createPointage,
  getPointagesByMatricule,
  getPointagesByDate,
}

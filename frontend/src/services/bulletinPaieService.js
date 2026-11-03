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

/** Fiche de paie détaillée (entreprise, salarié, période et rubriques). */
export function getFichePaie(id) {
  return api.get(`/api/bulletins/${encodeURIComponent(id)}/fiche`)
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

/**
 * Salaire de base prévu par le poste de l'employé.
 * Réponse : { salaireDeBase, titre, emploi, qualification, coefficient }
 */
export function getSalaireDuPoste(numeroMatricule) {
  return api.get(`/api/bulletins/employe/${encodeURIComponent(numeroMatricule)}/salaire`)
}

/**
 * Génère le bulletin de paie d'un employé pour un mois donné.
 * payload : { numeroMatricule, mois, annee, salaireDeBase,
 *             heuresSupplementaires, totalPrime, congeRestant }
 * Réponse : le bulletin créé (id, dateEmission, salaireBrute, salaireNet, …)
 */
export function genererBulletin(payload) {
  return api.post('/api/bulletins/generer', payload)
}

export default {
  getAllBulletins,
  getBulletinById,
  getBulletinsByEmploye,
  getFichePaie,
  getTotalPrimes,
  updateTotalPrimes,
  getSalaireBrut,
  updateSalaireBrut,
  createBulletin,
  getSalaireDuPoste,
  genererBulletin,
}

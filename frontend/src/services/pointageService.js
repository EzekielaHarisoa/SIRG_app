
import api from './api.js'

// ==========================================
// POINTAGES CLASSIQUES
// ==========================================

export function getAllPointages() {
  return api.get('/pointage')
}

export function createPointage(payload) {
  return api.post('/pointage', payload)
}

export function getPointagesByMatricule(numeroMatricule) {
  return api.get(
    `/pointage/filtreMatricule/${encodeURIComponent(numeroMatricule)}`
  )
}

export function getPointagesByDate(date) {
  return api.get(
    `/pointage/filtreDate/${encodeURIComponent(date)}`
  )
}

// ==========================================
// GESTION DU QR CODE
// ==========================================

/**
 * Génère un nouveau QR code de pointage.
 * Attention : chaque appel génère un nouveau token
 * et désactive le précédent.
 */
export function genererQrCode() {
  return api.get('/api/pointages/qrcode/actuel')
}

/**
 * Vérifie la validité d'un token QR.
 *
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export async function verifierQrCode(token) {
  return api.post('/api/pointages/qrcode/verifier', {
    token,
  })
}

// ==========================================
// GESTION DES ÉVÉNEMENTS DE POINTAGE
// ==========================================

/**
 * Enregistre un événement de pointage.
 *
 * @param {number|string} numeroMatricule
 * @param {'ENTREE'|'SORTIE_PAUSE'|'RETOUR_PAUSE'|'SORTIE'} typeEvenement
 */
export function enregistrerEvenement(
  numeroMatricule,
  typeEvenement
) {
  const matricule = encodeURIComponent(numeroMatricule)
  const type = encodeURIComponent(typeEvenement)

  return api.post(
    `/api/pointages/evenements/${matricule}?type=${type}`
  )
}

/**
 * Historique des événements d'un employé pour une journée.
 *
 * @param {number|string} numeroMatricule
 * @param {string} date - format ISO court : YYYY-MM-DD
 * @returns {Promise<Array<{id, pointageId, typeEvenement, dateHeure, modePointage}>>}
 */
export function getEvenementsByDate(numeroMatricule, date) {
  const matricule = encodeURIComponent(numeroMatricule)
  const jour = encodeURIComponent(date)

  return api.get(
    `/api/pointages/evenements/${matricule}/date/${jour}`
  )
}

// ==========================================
// EXPORT PAR DÉFAUT
// ==========================================

export default {
  getAllPointages,
  createPointage,
  getPointagesByMatricule,
  getPointagesByDate,
  genererQrCode,
  verifierQrCode,
  enregistrerEvenement,
  getEvenementsByDate,
}

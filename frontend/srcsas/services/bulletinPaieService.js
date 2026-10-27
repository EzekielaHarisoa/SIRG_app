import { api } from './api'

/**
 * Service for the "Bulletins de paie" resource (bulletin-paie-controller).
 * Endpoints:
 *   GET  /api/bulletins                         — list bulletins
 *   POST /api/bulletins                         — create a bulletin
 *   GET  /api/bulletins/{id}                    — bulletin by id
 *   GET  /api/bulletins/employe/{numeroMatricule} — bulletins for an employé
 *   GET  /api/bulletins/{id}/totalPrimes        — total primes of a bulletin
 *   PUT  /api/bulletins/{id}/totalPrimes        — update total primes
 *   GET  /api/bulletins/{id}/salaireBrut        — salaire brut of a bulletin
 *   PUT  /api/bulletins/{id}/salaireBrut        — update salaire brut
 *
 * NOTE: Confirm the request body schema for the PUT endpoints via Swagger
 * before finalizing the edit forms.
 */
export const bulletinPaieService = {
  list: () => api.get('/api/bulletins'),
  getById: (id) => api.get(`/api/bulletins/${id}`),
  getByEmploye: (numeroMatricule) =>
    api.get(`/api/bulletins/employe/${numeroMatricule}`),
  create: (payload) => api.post('/api/bulletins', payload),
  getTotalPrimes: (id) => api.get(`/api/bulletins/${id}/totalPrimes`),
  updateTotalPrimes: (id, payload) => api.put(`/api/bulletins/${id}/totalPrimes`, payload),
  getSalaireBrut: (id) => api.get(`/api/bulletins/${id}/salaireBrut`),
  updateSalaireBrut: (id, payload) => api.put(`/api/bulletins/${id}/salaireBrut`, payload),
}

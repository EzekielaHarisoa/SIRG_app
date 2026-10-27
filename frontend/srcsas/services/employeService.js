import { api } from './api'

/**
 * Service for the "Employés" resource (employe-controller).
 * Endpoints:
 *   GET  /employe                  — list employés
 *   POST /employe                  — create an employé
 *   PUT  /employe/{numeroMatricule}— update an employé
 * No DELETE endpoint is provided by the backend.
 */
export const employeService = {
  list: () => api.get('/employe'),
  create: (payload) => api.post('/employe', payload),
  update: (numeroMatricule, payload) => api.put(`/employe/${numeroMatricule}`, payload),
}

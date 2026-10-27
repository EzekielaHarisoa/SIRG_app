import { api } from './api'

/**
 * Service for the "Demandes de congé" resource (demande-conge-controller).
 * Endpoints:
 *   GET /demandeConge                            — list demandes
 *   POST /demandeConge                           — create a demande
 *   GET /demandeConge/employe/{numeroMatricule}  — demandes for an employé
 *   GET /demandeConge/byId/{id}                  — demande by id
 * No update or delete endpoint is provided by the backend.
 */
export const demandeCongeService = {
  list: () => api.get('/demandeConge'),
  create: (payload) => api.post('/demandeConge', payload),
  getByEmploye: (numeroMatricule) => api.get(`/demandeConge/employe/${numeroMatricule}`),
  getById: (id) => api.get(`/demandeConge/byId/${id}`),
}

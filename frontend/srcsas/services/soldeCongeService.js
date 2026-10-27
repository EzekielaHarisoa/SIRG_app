import { api } from './api'

/**
 * Service for the "Soldes de congé" resource (solde-conge-controller).
 * Endpoints:
 *   GET /soldeConge/{numeroMatricule}        — solde for an employé
 *   GET /soldeConge/{numeroMatricule}/{anne} — solde for a given year
 *   POST /soldeConge                          — create a solde
 *   PUT  /soldeConge                          — update a solde
 *
 * NOTE: The path parameter is named `anne` (as declared in the backend).
 * Confirm the expected request/response schema via Swagger before finalizing
 * the create/edit forms.
 */
export const soldeCongeService = {
  getByMatricule: (numeroMatricule) => api.get(`/soldeConge/${numeroMatricule}`),
  getByMatriculeAndYear: (numeroMatricule, annee) =>
    api.get(`/soldeConge/${numeroMatricule}/${annee}`),
  create: (payload) => api.post('/soldeConge', payload),
  update: (payload) => api.put('/soldeConge', payload),
}

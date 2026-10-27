import { api } from './api'

/**
 * Service for the "Pointages" resource (pointage-controller).
 * Endpoints:
 *   GET /pointage                         — list pointages
 *   POST /pointage                        — record a pointage
 *   GET /pointage/filtreMatricule/{numeroMatricule} — filter by matricule
 *   GET /pointage/filtreDate/{date}       — filter by date
 * No update or delete endpoint is provided by the backend.
 */
export const pointageService = {
  list: () => api.get('/pointage'),
  create: (payload) => api.post('/pointage', payload),
  filterByMatricule: (numeroMatricule) => api.get(`/pointage/filtreMatricule/${numeroMatricule}`),
  filterByDate: (date) => api.get(`/pointage/filtreDate/${date}`),
}

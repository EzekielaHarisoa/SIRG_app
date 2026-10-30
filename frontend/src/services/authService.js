import api from './api.js'

/**
 * Authenticates a user against the Spring Boot backend.
 *
 * Backend contract (AuthController): POST /api/auth/login
 *   body    : { login, motDePasse }
 *   success : 200 { id, login, numeroMatricule, nomEtPrenoms, role }
 *   failure : 401 { message }
 */
export function loginRequest({ login, motDePasse }) {
  return api.post('/api/auth/login', { login, motDePasse })
}

// No /auth/logout endpoint is provided by the backend: the session is held by
// the frontend only (see AuthContext), so logout just clears it locally.
export default { loginRequest }

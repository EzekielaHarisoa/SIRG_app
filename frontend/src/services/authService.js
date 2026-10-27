import api from './api.js'

// Auth service — left waiting for a real authentication endpoint.
//
// No authentication endpoint has been provided in the backend spec, so this
// service cannot authenticate a real user. The functions below are stubs that
// surface a clear error rather than faking a successful login.

export async function loginRequest({ login, password, role }) {
  // When a real /auth/login endpoint is available, replace this body with:
  //   return api.post('/auth/login', { login, password, role })
  throw new Error(
    "Aucun endpoint d'authentification nest configuré. La connexion réelle nest pas possible pour le moment.",
  )
}

export async function logoutRequest() {
  // No backend logout endpoint known. Local session is cleared by AuthContext.
  return null
}

export default { loginRequest, logoutRequest }

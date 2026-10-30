import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ROLES, ROLE_LABELS, normalizeRole } from '../config/contracts.js'
import { loginRequest } from '../services/authService.js'

// The session lives in sessionStorage only: no token is issued by the backend
// yet, and this is not a security mechanism.
const STORAGE_KEY = 'sirg.user'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
    if (parsed?.login && parsed?.role) return parsed
  } catch {
    /* ignore unreadable session storage */
  }
  return null
}

/**
 * Maps the backend response to the session shape used by the UI.
 * Throws when the response cannot drive a valid workspace.
 */
function toSessionUser(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Réponse inattendue du serveur. Veuillez réessayer.')
  }

  const role = normalizeRole(payload.role)
  if (!role) {
    throw new Error(
      `Le rôle « ${payload.role ?? 'inconnu'} » renvoyé par le serveur n’est pas reconnu par l’application.`,
    )
  }

  return {
    id: payload.id ?? null,
    login: payload.login ?? '',
    numeroMatricule: payload.numeroMatricule ?? null,
    nomEtPrenoms: payload.nomEtPrenoms || payload.login || '',
    role,
    backendRole: payload.role,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const login = useCallback(async ({ login: loginField, motDePasse }) => {
    const payload = await loginRequest({ login: loginField, motDePasse })
    const session = toSessionUser(payload)

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      /* storage may be unavailable; the in-memory session still works */
    }

    setUser(session)
    return session
  }, [])

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      sessionReady: true,
      role: user?.role || null,
      isAuthenticated: !!user,
      login,
      logout,
      ROLES,
      ROLE_LABELS,
    }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}

export default AuthContext

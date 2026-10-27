import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ROLES, ROLE_LABELS } from '../config/contracts.js'
import { loginRequest, logoutRequest } from '../services/authService.js'

const STORAGE_KEY = 'sirg.auth'

const AuthContext = createContext(null)

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.role && parsed.login) return parsed
  } catch {
    /* ignore */
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStored())

  // Real login is not possible until a backend auth endpoint exists.
  // login() attempts the real endpoint; on failure it surfaces the error and
  // does NOT fabricate a session. A separate previewRole() is provided for
  // development preview only.
  const login = useCallback(async ({ login: loginField, password, role }) => {
    const result = await loginRequest({ login: loginField, password, role })
    // If/when the backend returns a user object, persist it here.
    const session = {
      login: loginField,
      role,
      nom: result?.nom || loginField,
      ...result,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      /* ignore network error on logout */
    }
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  // Dev-only role preview — NOT a real authentication. Bypasses the backend.
  const previewRole = useCallback((role) => {
    const session = {
      login: `preview_${role.toLowerCase()}`,
      role,
      nom: `Prévisualisation ${ROLE_LABELS[role] || role}`,
      preview: true,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }, [])

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      isAuthenticated: !!user,
      isPreview: !!user?.preview,
      login,
      logout,
      previewRole,
      ROLES,
      ROLE_LABELS,
    }),
    [user, login, logout, previewRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}

export default AuthContext

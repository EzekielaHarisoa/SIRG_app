import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ROLES, ROLE_LABELS } from '../config/contracts.js'
import { currentUserRequest, loginRequest, logoutRequest } from '../services/authService.js'

const STORAGE_KEY = 'sirg.auth'

const AuthContext = createContext(null)

function readPreview() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (parsed?.preview && parsed.role && parsed.login) return parsed
  } catch {
    /* ignore invalid preview data */
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readPreview())
  const [sessionReady, setSessionReady] = useState(() => !!readPreview())

  useEffect(() => {
    if (user?.preview) {
      setSessionReady(true)
      return undefined
    }
    let active = true
    setSessionReady(false)
    currentUserRequest()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setSessionReady(true)
      })
    return () => {
      active = false
    }
  }, [user?.preview])

  // The API owns real sessions; only explicit development previews use local storage.
  const login = useCallback(async ({ login: loginField, password, role }) => {
    const result = await loginRequest({ login: loginField, password, role })
    // If/when the backend returns a user object, persist it here.
    const session = { ...result, login: result?.login || loginField }
    localStorage.removeItem(STORAGE_KEY)
    setUser(session)
    setSessionReady(true)
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
    setSessionReady(true)
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
    setSessionReady(true)
    return session
  }, [])

  const value = useMemo(
    () => ({
      user,
      sessionReady,
      role: user?.role || null,
      isAuthenticated: !!user,
      isPreview: !!user?.preview,
      login,
      logout,
      previewRole,
      ROLES,
      ROLE_LABELS,
    }),
    [user, sessionReady, login, logout, previewRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider')
  return ctx
}

export default AuthContext

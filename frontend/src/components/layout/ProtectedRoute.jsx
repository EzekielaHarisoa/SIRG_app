import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { ROLE_LABELS } from '../../config/contracts.js'

/**
 * ProtectedRoute — frontend-only access control.
 * Redirects to /login when not authenticated, or to the role's home when the
 * role does not match. This is NOT backend security.
 */
export default function ProtectedRoute({ allowRoles, children }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowRoles && !allowRoles.includes(role)) {
    const home = roleHomePath(role)
    return <Navigate to={home} replace />
  }

  return children
}

export function roleHomePath(role) {
  switch (role) {
    case 'EMPLOYE':
      return '/employe'
    case 'RH':
      return '/rh'
    case 'COMPTABLE':
      return '/comptable'
    default:
      return '/login'
  }
}

export function roleLabel(role) {
  return ROLE_LABELS[role] || role
}

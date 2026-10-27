import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute, { roleHomePath } from './components/layout/ProtectedRoute.jsx'
import RoleLayout from './layouts/RoleLayout.jsx'
import { ROLES } from './config/contracts.js'

import LoginPage from './pages/auth/LoginPage.jsx'
import UnavailablePage from './pages/UnavailablePage.jsx'
import EmployesPage from './pages/EmployesPage.jsx'

import EmployeDashboard from './pages/employe/EmployeDashboard.jsx'
import MesPointagesPage from './pages/employe/MesPointagesPage.jsx'
import MesCongesPage from './pages/employe/MesCongesPage.jsx'
import MesBulletinsPage from './pages/employe/MesBulletinsPage.jsx'
import MonSoldePage from './pages/employe/MonSoldePage.jsx'

import RHDashboard from './pages/rh/RHDashboard.jsx'
import PointagesRHPage from './pages/rh/PointagesRHPage.jsx'
import CongesRHPage from './pages/rh/CongesRHPage.jsx'
import SoldesRHPage from './pages/rh/SoldesRHPage.jsx'

import ComptableDashboard from './pages/comptable/ComptableDashboard.jsx'
import BulletinsPage from './pages/comptable/BulletinsPage.jsx'

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={roleHomePath(role)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<HomeRedirect />} />

      {/* Employé */}
      <Route
        path="/employe"
        element={
          <ProtectedRoute allowRoles={[ROLES.EMPLOYE]}>
            <RoleLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmployeDashboard />} />
        <Route path="pointages" element={<MesPointagesPage />} />
        <Route path="conges" element={<MesCongesPage />} />
        <Route path="bulletins" element={<MesBulletinsPage />} />
        <Route path="solde" element={<MonSoldePage />} />
      </Route>

      {/* RH */}
      <Route
        path="/rh"
        element={
          <ProtectedRoute allowRoles={[ROLES.RH]}>
            <RoleLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RHDashboard />} />
        <Route path="employes" element={<EmployesPage />} />
        <Route path="pointages" element={<PointagesRHPage />} />
        <Route path="conges" element={<CongesRHPage />} />
        <Route path="soldes" element={<SoldesRHPage />} />
      </Route>

      {/* Comptable */}
      <Route
        path="/comptable"
        element={
          <ProtectedRoute allowRoles={[ROLES.COMPTABLE]}>
            <RoleLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ComptableDashboard />} />
        <Route path="bulletins" element={<BulletinsPage />} />
      </Route>

      <Route path="*" element={<UnavailablePage title="Page introuvable" reason="Cette page nexiste pas." />} />
    </Routes>
  )
}

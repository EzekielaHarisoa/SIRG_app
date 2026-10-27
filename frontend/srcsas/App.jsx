import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import EmployesPage from './pages/EmployesPage'
import PointagesPage from './pages/PointagesPage'
import DemandesCongePage from './pages/DemandesCongePage'
import SoldesCongePage from './pages/SoldesCongePage'
import BulletinsPaiePage from './pages/BulletinsPaiePage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="employes" element={<EmployesPage />} />
          <Route path="pointages" element={<PointagesPage />} />
          <Route path="demandes-conge" element={<DemandesCongePage />} />
          <Route path="soldes-conge" element={<SoldesCongePage />} />
          <Route path="bulletins-paie" element={<BulletinsPaiePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

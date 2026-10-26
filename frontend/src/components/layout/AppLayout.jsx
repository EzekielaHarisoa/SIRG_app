import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const TITLES = {
  '/': ['Tableau de bord'],
  '/employes': ['Gestion RH', 'Employés'],
  '/pointages': ['Gestion RH', 'Pointages'],
  '/demandes-conge': ['Gestion RH', 'Demandes de congé'],
  '/soldes-conge': ['Gestion RH', 'Soldes de congé'],
  '/bulletins-paie': ['Gestion RH', 'Bulletins de paie'],
}

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  const matchKey = Object.keys(TITLES)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname === key || pathname.startsWith(key + '/'))

  const breadcrumb = matchKey ? TITLES[matchKey] : ['Gestion RH', 'Page introuvable']
  const title = breadcrumb[breadcrumb.length - 1]

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="md:pl-64">
        <Header
          title={title}
          breadcrumb={breadcrumb.length > 1 ? breadcrumb : undefined}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

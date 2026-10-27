import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_LABELS } from '../config/contracts.js'
import { roleHomePath } from '../components/layout/ProtectedRoute.jsx'

const MENU = {
  EMPLOYE: {
    home: '/employe',
    title: 'Espace employé',
    links: [
      { to: '/employe', label: 'Tableau de bord', end: true },
      { to: '/employe/pointages', label: 'Mes pointages' },
      { to: '/employe/conges', label: 'Mes congés' },
      { to: '/employe/bulletins', label: 'Mes bulletins' },
      { to: '/employe/solde', label: 'Mon solde' },
    ],
  },
  RH: {
    home: '/rh',
    title: 'Espace RH',
    links: [
      { to: '/rh', label: 'Tableau de bord', end: true },
      { to: '/rh/employes', label: 'Employés' },
      { to: '/rh/pointages', label: 'Pointages' },
      { to: '/rh/conges', label: 'Congés' },
      { to: '/rh/soldes', label: 'Soldes de congé' },
    ],
  },
  COMPTABLE: {
    home: '/comptable',
    title: 'Espace comptable',
    links: [
      { to: '/comptable', label: 'Tableau de bord', end: true },
      { to: '/comptable/bulletins', label: 'Bulletins de paie' },
    ],
  },
}

export default function RoleLayout({ children }) {
  const { user, role, logout, isPreview } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const config = MENU[role] || MENU.EMPLOYE

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {config.links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            [
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            ].join(' ')
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - desktop */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold text-slate-800">SIRG</p>
          <p className="text-xs text-slate-500">{config.title}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{navLinks}</div>
        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-medium text-slate-700">{user?.nom || user?.login}</p>
            <p className="text-xs text-slate-400">{ROLE_LABELS[role] || role}</p>
            {isPreview && (
              <p className="mt-1 text-[11px] font-medium text-amber-600">
                Prévisualisation — non sécurisé
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <div>
            <p className="text-sm font-semibold text-slate-800">SIRG</p>
            <p className="text-xs text-slate-500">{config.title}</p>
          </div>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600"
            aria-label="Menu"
          >
            ☰
          </button>
        </header>

        {menuOpen && (
          <div className="border-b border-slate-200 bg-white p-3 md:hidden">{navLinks}</div>
        )}

        {/* Desktop header */}
        <header className="hidden border-b border-slate-200 bg-white px-6 py-3 md:flex md:items-center md:justify-between">
          <h1 className="text-sm font-medium text-slate-700">{config.title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.nom || user?.login}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Déconnexion
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-6xl">{children || <Outlet />}</div>
        </main>
      </div>
    </div>
  )
}

export { MENU, roleHomePath }

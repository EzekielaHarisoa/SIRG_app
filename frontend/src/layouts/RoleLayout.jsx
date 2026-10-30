import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_LABELS } from '../config/contracts.js'
import { roleHomePath } from '../components/layout/ProtectedRoute.jsx'

const MENU = {
  EMPLOYE: {
    home: '/employe',
    title: 'Espace employé',
    links: [
      { to: '/employe', label: 'Tableau de bord', icon: 'grid', end: true },
      { to: '/employe/pointages', label: 'Mes pointages', icon: 'clock' },
      { to: '/employe/conges', label: 'Mes congés', icon: 'calendar' },
      { to: '/employe/bulletins', label: 'Mes bulletins', icon: 'document' },
      { to: '/employe/solde', label: 'Mon solde', icon: 'wallet' },
    ],
  },
  RH: {
    home: '/rh',
    title: 'Espace RH',
    links: [
      { to: '/rh', label: 'Tableau de bord', icon: 'grid', end: true },
      { to: '/rh/employes', label: 'Employés', icon: 'users' },
      { to: '/rh/pointages', label: 'Pointages', icon: 'clock' },
      { to: '/rh/conges', label: 'Congés', icon: 'calendar' },
      { to: '/rh/soldes', label: 'Soldes de congé', icon: 'wallet' },
    ],
  },
  COMPTABLE: {
    home: '/comptable',
    title: 'Espace comptable',
    links: [
      { to: '/comptable', label: 'Tableau de bord', icon: 'grid', end: true },
      { to: '/comptable/bulletins', label: 'Bulletins de paie', icon: 'document' },
    ],
  },
}

const ICONS = {
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
  wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 14h2" /><path d="M6 5V4a2 2 0 0 1 2-2h10" /></>,
}

function NavIcon({ name }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] shrink-0">{ICONS[name]}</svg>
}

function initials(name) {
  return (name || 'SIRG').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export default function RoleLayout({ children }) {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const config = MENU[role] || MENU.EMPLOYE
  const displayName = user?.nomEtPrenoms || user?.login || 'Utilisateur'
  const activeLink = [...config.links]
    .sort((a, b) => b.to.length - a.to.length)
    .find((link) => pathname === link.to || pathname.startsWith(`${link.to}/`))

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const navLinks = (
    <nav aria-label="Navigation principale" className="space-y-1">
      {config.links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) => [
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isActive
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          ].join(' ')}
        >
          <NavIcon name={link.icon} />
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-label="Fermer la navigation"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <p className="text-lg font-semibold tracking-tight text-slate-900">SIRG</p>
            <p className="text-[11px] text-slate-500">Gestion des ressources humaines</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
            aria-label="Fermer la navigation"
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-3">
          <p className="text-xs font-medium text-slate-500">{config.title}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          {navLinks}
        </div>

        <div className="border-t border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">{initials(displayName)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{ROLE_LABELS[role] || role}</p>
            </div>
            <button onClick={handleLogout} aria-label="Déconnexion" title="Déconnexion" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-md border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 md:hidden"
            aria-label="Ouvrir la navigation"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-5 w-5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-slate-900 md:text-lg">{activeLink?.label || config.title}</h1>
            {activeLink && (
              <nav className="mt-0.5 hidden text-xs text-slate-500 sm:block" aria-label="Fil d’Ariane">
                <ol className="flex items-center gap-1">
                  <li>{config.title}</li>
                  <li aria-hidden="true" className="text-slate-300">/</li>
                  <li className="text-slate-700">{activeLink.label}</li>
                </ol>
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">{initials(displayName)}</div>
              <span className="max-w-40 truncate text-sm text-slate-700">{displayName}</span>
            </div>
            <button onClick={handleLogout} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 md:hidden">Quitter</button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export { MENU, roleHomePath }

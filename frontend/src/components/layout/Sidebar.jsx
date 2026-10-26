import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Wallet,
  FileText,
  X,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/employes', label: 'Employés', icon: Users },
  { to: '/pointages', label: 'Pointages', icon: Clock },
  { to: '/demandes-conge', label: 'Demandes de congé', icon: CalendarDays },
  { to: '/soldes-conge', label: 'Soldes de congé', icon: Wallet },
  { to: '/bulletins-paie', label: 'Bulletins de paie', icon: FileText },
]

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-neutral-900/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Navigation principale"
      >
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            SIRG
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 md:hidden"
            aria-label="Fermer la navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-none" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-200 px-5 py-4">
          <p className="text-xs text-neutral-400">
            Système Intégré de Gestion des RH
          </p>
        </div>
      </aside>
    </>
  )
}

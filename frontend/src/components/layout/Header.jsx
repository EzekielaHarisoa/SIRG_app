import { Menu } from 'lucide-react'

export default function Header({ title, breadcrumb, onOpenSidebar }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-md border border-neutral-200 p-2 text-neutral-600 transition hover:bg-neutral-50 md:hidden"
        aria-label="Ouvrir la navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-neutral-900 md:text-lg">
          {title}
        </h1>
        {breadcrumb && (
          <nav className="mt-0.5 hidden text-xs text-neutral-500 sm:block" aria-label="Fil d'Ariane">
            <ol className="flex items-center gap-1">
              {breadcrumb.map((crumb, i) => (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-neutral-300">/</span>}
                  <span className={i === breadcrumb.length - 1 ? 'text-neutral-700' : ''}>
                    {crumb}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      {/* Profile zone — intentionally empty.
          A user profile block must only be displayed once a real
          authentication endpoint exists on the backend. */}
    </header>
  )
}

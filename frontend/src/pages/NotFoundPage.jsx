import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-5xl font-bold text-neutral-300">404</p>
      <h2 className="text-xl font-semibold text-neutral-900">Page introuvable</h2>
      <p className="max-w-sm text-sm text-neutral-500">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
      >
        <Home className="h-4 w-4" />
        Retour au tableau de bord
      </Link>
    </div>
  )
}

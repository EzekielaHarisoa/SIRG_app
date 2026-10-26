import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorState({
  title = 'Une erreur est survenue',
  message = "Les données n'ont pas pu être chargées.",
  onRetry,
  retryLabel = 'Réessayer',
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-error-200 bg-error-50 px-6 py-16 text-center ${className}`}
    >
      <AlertTriangle className="h-10 w-10 text-error-500" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-error-700">{title}</p>
        <p className="mt-1 text-sm text-error-600">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-2 rounded-md border border-error-300 bg-white px-3 py-1.5 text-sm font-medium text-error-700 transition hover:bg-error-100"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </div>
  )
}

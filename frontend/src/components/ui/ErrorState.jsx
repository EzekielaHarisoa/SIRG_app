import Button from './Button.jsx'

export default function ErrorState({ error, onRetry }) {
  const message =
    error?.message || (typeof error === 'string' ? error : 'Une erreur est survenue.')
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-3">
        <svg
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">Une erreur est survenue</p>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onRetry && (
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={onRetry}>
                Réessayer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

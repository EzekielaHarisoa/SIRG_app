import { Loader2 } from 'lucide-react'

export default function LoadingState({ message = 'Chargement…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-neutral-500 ${className}`}>
      <Loader2 className="h-7 w-7 animate-spin text-primary-600" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

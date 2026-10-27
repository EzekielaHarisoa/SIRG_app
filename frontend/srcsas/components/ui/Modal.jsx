import { useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * Accessible modal dialog for forms and detail views.
 */
export default function Modal({ open, title, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-neutral-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-neutral-200 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

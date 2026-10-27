/**
 * Standard action button used across pages.
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 */
export default function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 border border-transparent',
    secondary: 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-300',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 border border-transparent',
    danger: 'bg-error-600 text-white hover:bg-error-700 border border-transparent',
  }

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

const VARIANTS = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-500 border border-transparent',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400',
  accent:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600 border border-transparent',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600 border border-transparent',
  ghost:
    'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 focus-visible:outline-slate-400',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  children,
  ...rest
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.primary
  const sizeClass = SIZES[size] || SIZES.md
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variantClass,
        sizeClass,
        className,
      ].join(' ')}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {children}
    </button>
  )
}

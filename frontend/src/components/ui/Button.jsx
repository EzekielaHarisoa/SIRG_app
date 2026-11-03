/*
 * Palette de la page de connexion, petits arrondis (rounded-sm) :
 *  #005EB8 bleu (action principale)   #00449E marine (survol / texte sur teinte)
 *  #E3EEFC teinte (fond clair)        gris (slate) pour tout le reste
 */
const VARIANTS = {
  primary:
    'border border-transparent bg-[#005EB8] text-white hover:bg-[#00449E] active:bg-[#003A87] focus-visible:outline-[#005EB8]',
  secondary:
    'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-[#005EB8]',
  accent:
    'border border-[#005EB8]/30 bg-[#E3EEFC] text-[#00449E] hover:bg-[#D2E3F9] active:bg-[#C2D9F5] focus-visible:outline-[#005EB8]',
  danger:
    'border border-transparent bg-red-700 text-white hover:bg-red-800 active:bg-red-900 focus-visible:outline-red-700',
  ghost:
    'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-[#005EB8]',
}

const SIZES = {
  sm: 'min-h-7 px-2.5 py-1 text-xs leading-5',
  md: 'min-h-9 px-3.5 py-1.5 text-[13px] leading-5',
  lg: 'min-h-10 px-4 py-2 text-sm leading-5',
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
      aria-busy={loading || undefined}
      className={[
        'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-sm font-semibold transition-colors',
        'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
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
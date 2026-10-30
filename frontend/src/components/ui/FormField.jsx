const TYPES = ['text', 'email', 'tel', 'password', 'number', 'date', 'time', 'datetime-local']

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
  hint,
  options,
  rows,
  autoComplete,
  className = '',
}) {
  const inputId = `field-${name}`
  const resolvedType = TYPES.includes(type) ? type : 'text'

  const baseClass = [
    'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400',
    'focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400',
    'disabled:cursor-not-allowed disabled:bg-slate-100',
    error ? 'border-red-400' : 'border-slate-300',
    className,
  ].join(' ')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {options ? (
        <select
          id={inputId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={baseClass}
        >
          <option value="">— Sélectionner —</option>
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt
            const lbl = typeof opt === 'object' ? opt.label : opt
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            )
          })}
        </select>
      ) : rows ? (
        <textarea
          id={inputId}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          rows={rows}
          className={baseClass}
        />
      ) : (
        <input
          id={inputId}
          name={name}
          type={resolvedType}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={baseClass}
        />
      )}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

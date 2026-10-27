/**
 * Reusable labeled form field. Renders a text input by default; pass
 * `as="textarea"` or `as="select"` to switch the control, or override with
 * `children`.
 */
export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  as = 'input',
  children,
  ...props
}) {
  const id = `field-${name}`
  const inputClass = `w-full rounded-md border px-3 py-2 text-sm text-neutral-900 transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${
    error ? 'border-error-400 focus:ring-error-500' : 'border-neutral-300'
  }`

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="ml-0.5 text-error-600">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={inputClass}
          {...props}
        />
      ) : as === 'select' ? (
        <select
          id={id}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          className={inputClass}
          {...props}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={inputClass}
          {...props}
        />
      )}
      {error && <p className="text-xs text-error-600">{error}</p>}
    </div>
  )
}

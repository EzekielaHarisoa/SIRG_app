import FormField from './FormField.jsx'
import Button from './Button.jsx'

/**
 * FilterBar — renders a configurable set of filter fields + a submit button.
 * filters: [{ name, label, type?, options?, placeholder? }]
 * Values are controlled by `value`; onApply receives the new values.
 */
export default function FilterBar({ filters = [], value, onChange, onApply, onReset, loading }) {
  const handleChange = (e) => {
    const { name, value: v } = e.target
    onChange({ ...value, [name]: v })
  }
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-white p-4">
      {filters.map((f) => (
        <div key={f.name} className="min-w-[160px] flex-1">
          <FormField
            label={f.label}
            name={f.name}
            type={f.type || 'text'}
            value={value[f.name] ?? ''}
            onChange={handleChange}
            placeholder={f.placeholder}
            options={f.options}
          />
        </div>
      ))}
      <div className="flex items-end gap-2">
        <Button variant="primary" onClick={onApply} loading={loading}>
          Filtrer
        </Button>
        {onReset && (
          <Button variant="secondary" onClick={onReset} disabled={loading}>
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  )
}

'use client'

export default function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  defaultValue,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  helperText,
  className = '',
  mono = false,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id || name}
          className="block text-xs font-medium text-slate uppercase tracking-wider mb-1.5"
        >
          {label} {required && <span className="text-rose">*</span>}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full bg-surface border border-border rounded-[6px] px-3.5 py-2 text-sm text-ink placeholder:text-slate/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber focus:border-amber disabled:bg-paper disabled:text-dust disabled:cursor-not-allowed ${
          mono ? 'font-mono-ledger' : ''
        } ${error ? 'border-rose focus:ring-rose' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-rose font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-slate">{helperText}</p>
      )}
    </div>
  )
}

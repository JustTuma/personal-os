import { SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, placeholder, options, className, id, style, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {label && (
          <label
            htmlFor={selectId}
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#a0a0b0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            ref={ref}
            id={selectId}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '10px',
              paddingLeft: '12px',
              paddingRight: '36px',
              fontSize: '13.5px',
              backgroundColor: '#181820',
              border: `1px solid ${error ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.08)'}`,
              color: '#f2f2f8',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer',
              transition: 'border-color 150ms',
              ...style,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(99, 102, 241, 0.6)'
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.08)'
              props.onBlur?.(e)
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled style={{ backgroundColor: '#181820', color: '#646473' }}>
                {placeholder}
              </option>
            )}
            {options.map(opt => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                style={{ backgroundColor: '#181820', color: '#f2f2f8', padding: '8px' }}
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            color="#a0a0b0"
            style={{
              position: 'absolute',
              right: '12px',
              pointerEvents: 'none',
            }}
          />
        </div>
        {error && <p style={{ fontSize: '12px', color: '#f87171', margin: 0 }}>{error}</p>}
        {hint && !error && <p style={{ fontSize: '12px', color: '#646473', margin: 0 }}>{hint}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
